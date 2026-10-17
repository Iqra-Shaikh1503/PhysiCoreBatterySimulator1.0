from contextlib import asynccontextmanager
from datetime import timezone
from uuid import uuid4, UUID
import hashlib, json, logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func, text
from .settings import Settings
from .db import connect
from .models import SimulationCase, ParameterSnapshot, SimulationJob, ResultSummary
from .schemas import (Configuration, Review, Submission, JobView, JobPage, CaseCreate, CaseView,
                      Health, Capabilities, BaselineResponse, ModelInfo, Standards, PARAMETERS)
from .parameters import baseline, review, to_si
from .jobs import DevelopmentExecutor, FoundationRunner

MODEL_VERSION = "znce-published-spec-v1"
MODULES = ["electrochemistry", "species_transport", "fluid_flow", "membrane_transport", "reservoir_balances", "numerical_integration", "efficiency", "validation", "sensitivity", "optimization", "reports"]

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {"level": record.levelname, "logger": record.name, "message": record.getMessage()}
        for key in ("job_id", "status"):
            if hasattr(record, key): payload[key] = getattr(record, key)
        if record.exc_info: payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)

handler = logging.StreamHandler(); handler.setFormatter(JsonFormatter())
logging.getLogger("battery").addHandler(handler)
logging.getLogger("battery").setLevel(logging.INFO)

def utc(value):
    return value.replace(tzinfo=timezone.utc) if value and value.tzinfo is None else value

def create_app(settings=None, runner=None, executor_factory=DevelopmentExecutor):
    settings = settings or Settings.from_env()
    engine, sessions = connect(settings.database_url)
    runner = runner or FoundationRunner()
    executor = executor_factory(sessions, runner, settings.poll_interval)

    @asynccontextmanager
    async def lifespan(app):
        # Startup must fail clearly if migrations have not been applied.
        with engine.connect() as connection:
            try:
                revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
                if revision != "0001_foundation": raise RuntimeError("Unsupported database revision")
            except Exception as exc:
                raise RuntimeError("Run 'python -m alembic upgrade head' from backend before starting the API.") from exc
        executor.start()
        yield
        executor.stop(); engine.dispose()

    app = FastAPI(title="Physicore Battery Lab", version="0.2.0", lifespan=lifespan)
    app.state.sessions, app.state.engine, app.state.executor = sessions, engine, executor
    app.add_middleware(CORSMiddleware, allow_origins=list(settings.cors_origins), allow_credentials=False,
                       allow_methods=["GET", "POST", "DELETE"], allow_headers=["Content-Type"])

    @app.exception_handler(RequestValidationError)
    async def invalid_input(request, exc):
        # Exclude raw inputs, including non-finite values and sensitive request data.
        return JSONResponse(status_code=422, content={"detail": [
            {"loc": list(error["loc"]), "msg": error["msg"], "type": error["type"]}
            for error in exc.errors()]})

    @app.exception_handler(SQLAlchemyError)
    async def database_error(request, exc):
        logging.getLogger("battery.api").error("database_operation_failed", exc_info=exc)
        return JSONResponse(status_code=503, content={"detail": "Database unavailable. Check server logs and migration state."})

    @app.get("/health", response_model=Health)
    def health():
        with sessions() as session: session.execute(text("SELECT 1"))
        return Health()

    @app.get("/capabilities", response_model=Capabilities)
    def capabilities():
        return Capabilities(modules={key: "not-implemented" for key in MODULES})

    @app.get("/model-info", response_model=ModelInfo)
    def model_info():
        return ModelInfo(name="Zinc-Cerium published model specification", version=MODEL_VERSION,
                         reference="Amini & Pritzker (2021), doi:10.1016/j.jpowsour.2021.230237",
                         scientificStatus="Foundation only; no implemented or independently validated solver",
                         unresolved=[f"U-{i:02}" for i in range(1,17)])

    @app.get("/parameters/baseline", response_model=BaselineResponse)
    def get_baseline():
        config = baseline()
        return BaselineResponse(configuration=config, parameters=PARAMETERS, review=review(config))

    @app.get("/parameters/schema", response_model=dict)
    def parameter_schema():
        return Configuration.model_json_schema()

    @app.post("/configurations/validate", response_model=Review)
    def check_configuration(configuration: Configuration):
        return review(configuration)

    @app.get("/validation-standards", response_model=Standards)
    def standards():
        return Standards(gates=[{"id": key, "status": "not-evaluated", "description": description} for key, description in
            [("T-BASELINE", "Unit conversions and immutable paper provenance"),
             ("T-CONSERVATION", "Cell plus tank mass and charge conservation"),
             ("T-REFINEMENT", "Independent mesh and timestep refinement"),
             ("T-EXPERIMENT", "Independent comparison to genuine experimental data")]])

    def view(session, job):
        snapshot = session.get(ParameterSnapshot, job.snapshot_id)
        result = session.get(ResultSummary, job.id)
        return JobView(id=job.id, caseId=job.case_id, status=job.status,
                       createdAt=utc(job.created_at), startedAt=utc(job.started_at), finishedAt=utc(job.finished_at),
                       configuration=snapshot.configuration, configurationHash=snapshot.configuration_hash,
                       modelVersion=snapshot.model_version, runnerVersion=job.runner_version,
                       error=job.error, resultSummary=result.summary if result else None)

    @app.post("/simulations", status_code=202, response_model=Submission)
    def submit(configuration: Configuration):
        payload = configuration.model_dump(mode="json")
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        case_id, snapshot_id, job_id = (str(uuid4()) for _ in range(3))
        with sessions.begin() as session:
            pending = session.scalar(select(func.count()).select_from(SimulationJob).where(SimulationJob.status.in_(["queued", "running"])))
            if pending >= settings.max_pending:
                raise HTTPException(429, "Development queue is full; retry after jobs finish.")
            session.add(SimulationCase(id=case_id, name="Submitted simulation", configuration=payload))
            session.add(ParameterSnapshot(id=snapshot_id, configuration=payload, si_values=to_si(configuration), provenance=PARAMETERS,
                                          configuration_hash=digest, model_version=MODEL_VERSION))
            session.flush()
            session.add(SimulationJob(id=job_id, case_id=case_id, snapshot_id=snapshot_id, status="queued", runner_version=runner.version))
        return Submission(jobId=job_id, pollingUrl="/simulations/"+job_id)

    @app.get("/simulations", response_model=JobPage)
    def list_jobs(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
        with sessions() as session:
            jobs = session.scalars(select(SimulationJob).order_by(SimulationJob.created_at.desc(), SimulationJob.id).offset(offset).limit(limit))
            return JobPage(items=[view(session,j) for j in jobs], total=session.scalar(select(func.count()).select_from(SimulationJob)), limit=limit, offset=offset)

    @app.get("/simulations/{simulation_id}", response_model=JobView)
    def get_job(simulation_id: UUID):
        with sessions() as session:
            job = session.get(SimulationJob, str(simulation_id))
            if job is None: raise HTTPException(404, "Simulation not found")
            return view(session, job)

    def case_view(case):
        return CaseView(id=case.id, name=case.name, configuration=case.configuration, createdAt=utc(case.created_at))

    @app.post("/cases", status_code=201, response_model=CaseView)
    def save_case(item: CaseCreate):
        with sessions.begin() as session:
            case = SimulationCase(id=str(uuid4()), name=item.name, configuration=item.configuration.model_dump(mode="json"))
            session.add(case); session.flush()
            return case_view(case)

    @app.get("/cases", response_model=list[CaseView])
    def cases(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
        with sessions() as session:
            return [case_view(c) for c in session.scalars(select(SimulationCase).order_by(SimulationCase.created_at.desc()).offset(offset).limit(limit))]

    return app

app = create_app()
