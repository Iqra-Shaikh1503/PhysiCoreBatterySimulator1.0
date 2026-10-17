from typing import Annotated, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, create_model, field_validator
import json
from pathlib import Path

PARAMETERS = json.loads((Path(__file__).parent / "data/parameters.json").read_text(encoding="utf-8"))
UNITS = {p["key"]: p["unit"] for p in PARAMETERS}
BASELINE = {p["key"]: int(p["baseline"]) if p["integer"] else p["baseline"] for p in PARAMETERS}

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

fields = {}
for p in PARAMETERS:
    rules = {"description": p["label"] + " [" + p["unit"] + "]", "json_schema_extra": {"unit": p["unit"], "source": p["source"]}}
    rules["gt" if p["exclusiveMin"] else "ge"] = p["min"]
    if p["max"] is not None:
        rules["le"] = p["max"]
    if p["key"] == "porosity":
        rules.pop("le", None); rules["lt"] = 1
    fields[p["key"]] = (Annotated[int if p["integer"] else float, Field(strict=True, **rules)], ...)
Values = create_model("Values", __base__=StrictModel, **fields)

class Configuration(StrictModel):
    values: Values
    mode: Literal["charge", "discharge"] = "charge"
    model: Literal["published"] = "published"
    zincInventory: None = None
    schemaVersion: Literal[1] = 1
    seed: Annotated[int, Field(strict=True, ge=0, le=2147483647)] = 0
    units: dict[str, str] = Field(default_factory=lambda: dict(UNITS))

    @field_validator("units")
    @classmethod
    def correct_units(cls, units):
        if units != UNITS:
            raise ValueError("Supply the complete source-unit map from /parameters/schema; conversions are never inferred.")
        return units

class Issue(StrictModel):
    field: str | None = None
    severity: Literal["warning", "error"]
    message: str

class Review(StrictModel):
    valid: bool
    issues: list[Issue]

class JobError(StrictModel):
    code: str
    message: str

class Submission(StrictModel):
    jobId: str
    status: Literal["queued"] = "queued"
    pollingUrl: str

class JobView(StrictModel):
    id: str
    caseId: str
    status: Literal["queued", "running", "completed", "failed"]
    createdAt: datetime
    startedAt: datetime | None
    finishedAt: datetime | None
    configuration: Configuration
    configurationHash: str
    modelVersion: str
    runnerVersion: str
    validationStatus: Literal["not-validated"] = "not-validated"
    plots: dict = Field(default_factory=dict)
    diagnostics: list[dict] = Field(default_factory=list)
    resultSummary: dict | None = None
    error: JobError | None

class JobPage(StrictModel):
    items: list[JobView]
    total: int
    limit: int
    offset: int

class CaseCreate(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    configuration: Configuration

    @field_validator("name")
    @classmethod
    def clean_name(cls, value):
        if not value.strip():
            raise ValueError("Case name cannot be blank")
        return value.strip()

class CaseView(CaseCreate):
    id: str
    createdAt: datetime

class Health(StrictModel):
    status: Literal["ok"] = "ok"
    database: Literal["ok"] = "ok"
    phase: int = 2

class Capabilities(StrictModel):
    phase: int = 2
    solverImplemented: bool = False
    persistence: bool = True
    asyncJobs: bool = True
    runner: str = "in-process-development"
    modules: dict[str, str]

class BaselineResponse(StrictModel):
    configuration: Configuration
    parameters: list[dict]
    review: Review

class ModelInfo(StrictModel):
    name: str
    version: str
    reference: str
    scientificStatus: str
    unresolved: list[str]

class Standards(StrictModel):
    status: str = "planned-not-executed"
    gates: list[dict[str, str]]
