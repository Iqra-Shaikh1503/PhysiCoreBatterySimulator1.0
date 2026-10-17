from typing import Protocol
from threading import Event, Thread
import logging
from sqlalchemy import select
from .models import SimulationJob, ParameterSnapshot, ResultSummary, now
from .schemas import Configuration
from .physics import UnsupportedPhysics

logger = logging.getLogger("battery.jobs")

class ScientificRunner(Protocol):
    version: str
    def run(self, configuration: Configuration) -> dict: ...

class FoundationRunner:
    version = "phase2-unsupported-v1"
    def run(self, configuration: Configuration) -> dict:
        raise UnsupportedPhysics("The coupled battery solver is not implemented. Implement and verify Phases 3-5 before scientific execution.")

class Executor(Protocol):
    def start(self) -> None: ...
    def stop(self) -> None: ...

class DevelopmentExecutor:
    """Single-process development dispatcher. DB is the queue; never use multiple API workers."""
    def __init__(self, sessions, runner: ScientificRunner, interval=0.25):
        self.sessions, self.runner, self.interval = sessions, runner, interval
        self.stopping = Event()
        self.thread = Thread(target=self.loop, name="battery-worker", daemon=True)

    def start(self):
        # A previous process cannot still own these jobs in the supported single-worker setup.
        with self.sessions.begin() as session:
            for job in session.scalars(select(SimulationJob).where(SimulationJob.status == "running")):
                job.status = "failed"; job.finished_at = now()
                job.error = {"code": "WORKER_INTERRUPTED", "message": "Development worker stopped during execution. Submit a new job."}
        self.thread.start()

    def stop(self):
        self.stopping.set()
        self.thread.join(timeout=10)

    def loop(self):
        while not self.stopping.is_set():
            try:
                if not self.run_next():
                    self.stopping.wait(self.interval)
            except Exception:
                logger.exception("worker_dispatch_failed")
                self.stopping.wait(self.interval)

    def run_next(self):
        with self.sessions.begin() as session:
            job = session.scalar(select(SimulationJob).where(SimulationJob.status == "queued").order_by(SimulationJob.created_at, SimulationJob.id).limit(1))
            if job is None:
                return False
            job.status = "running"; job.started_at = now()
            job_id = job.id
            configuration = Configuration.model_validate(session.get(ParameterSnapshot, job.snapshot_id).configuration)
        logger.info("job_running", extra={"job_id": job_id})
        result = None
        try:
            result = self.runner.run(configuration)
            status, error = "completed", None
        except UnsupportedPhysics as exc:
            status, error = "failed", {"code": exc.code, "message": str(exc)}
        except Exception:
            logger.exception("scientific_runner_failed", extra={"job_id": job_id})
            status, error = "failed", {"code": "EXECUTION_FAILED", "message": "Runner failed. Consult server logs using the job ID."}
        with self.sessions.begin() as session:
            job = session.get(SimulationJob, job_id)
            job.status, job.error, job.finished_at = status, error, now()
            if result is not None:
                session.add(ResultSummary(job_id=job_id, summary=result, artifact_uri=None))
        logger.info("job_terminal", extra={"job_id": job_id, "status": status})
        return True
