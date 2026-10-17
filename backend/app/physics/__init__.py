from typing import Protocol
from ..schemas import Configuration

class UnsupportedPhysics(RuntimeError):
    code = "SOLVER_NOT_IMPLEMENTED"

class PhysicsModule(Protocol):
    def evaluate(self, configuration: Configuration) -> dict: ...

class UnsupportedModule:
    name = "physics"
    def evaluate(self, configuration: Configuration) -> dict:
        raise UnsupportedPhysics(f"{self.name} is not implemented in Phase 2.")
