"""Phase 2 schema, frozen at revision creation."""
from alembic import op
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, JSON, ForeignKey, CheckConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

def now():
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    pass

class SimulationCase(Base):
    __tablename__ = "simulation_cases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    configuration: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class ParameterSnapshot(Base):
    __tablename__ = "parameter_snapshots"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    configuration: Mapped[dict] = mapped_column(JSON)
    si_values: Mapped[dict] = mapped_column(JSON)
    provenance: Mapped[list] = mapped_column(JSON)
    configuration_hash: Mapped[str] = mapped_column(String(64))
    model_version: Mapped[str] = mapped_column(String(40))

class SimulationJob(Base):
    __tablename__ = "simulation_jobs"
    __table_args__ = (CheckConstraint("status IN ('queued','running','completed','failed')", name="job_status"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("simulation_cases.id"))
    snapshot_id: Mapped[str] = mapped_column(ForeignKey("parameter_snapshots.id"))
    status: Mapped[str] = mapped_column(String(16), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    runner_version: Mapped[str] = mapped_column(String(40))

class ResultSummary(Base):
    __tablename__ = "result_summaries"
    job_id: Mapped[str] = mapped_column(ForeignKey("simulation_jobs.id"), primary_key=True)
    summary: Mapped[dict] = mapped_column(JSON)
    artifact_uri: Mapped[str | None] = mapped_column(String(500))

class ExperimentalDataset(Base):
    __tablename__ = "experimental_datasets"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    artifact_uri: Mapped[str] = mapped_column(String(500))
    provenance: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class ValidationRun(Base):
    __tablename__ = "validation_runs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("simulation_jobs.id"))
    dataset_id: Mapped[str] = mapped_column(ForeignKey("experimental_datasets.id"))
    status: Mapped[str] = mapped_column(String(40))
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

revision = "0001_foundation"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    Base.metadata.create_all(bind=op.get_bind())

def downgrade():
    Base.metadata.drop_all(bind=op.get_bind())
