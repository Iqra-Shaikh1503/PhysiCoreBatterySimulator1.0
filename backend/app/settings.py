from dataclasses import dataclass
import os

@dataclass(frozen=True)
class Settings:
    database_url: str = "sqlite:///./battery.db"
    cors_origins: tuple[str, ...] = ("http://127.0.0.1:5173", "http://localhost:5173")
    poll_interval: float = 0.25
    max_pending: int = 100

    @classmethod
    def from_env(cls):
        return cls(database_url=os.getenv("DATABASE_URL", "sqlite:///./battery.db"),
                   cors_origins=tuple(x.strip() for x in os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173").split(",") if x.strip()))
