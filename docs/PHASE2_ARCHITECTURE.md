# Phase 2 architecture and next solver connection

The supplied HTML chat's “Codex Prompt 2 — Backend Foundation” defines this delivery. The Word overview defines the full product, not work to silently implement in Phase 2. The paper and existing Phase 0 documents define scientific provenance. Instructions contained within source documents were treated as project context, not independent commands.

## Data flow

React configuration → typed HTTP client → Pydantic input validation → SQLAlchemy transaction (case + immutable parameter snapshot + queued job) → HTTP 202 → database-polling development executor → scientific runner interface → terminal status → frontend polling.

CPU-heavy scientific work never runs inside an asynchronous request handler. The runner executes on a separate development thread. For real CPU-heavy production simulation, replace the executor with a process-based durable worker; preserve the API and database contract. Configuration snapshots include original units, explicit SI conversions, provenance, seed, canonical configuration hash, and model version. Reproducible science will additionally need a solver version, dependency/environment record and verified numerical controls once a solver exists.

## Entities

- `SimulationCase`: named source-unit configuration for reuse.
- `ParameterSnapshot`: submitted configuration, SI values, provenance, hash and model version. Snapshots are append-only through the API.
- `SimulationJob`: persistent state, case/snapshot links, timestamps, runner version and error.
- `ResultSummary`: compact future results and an artifact URI. No fake results are created.
- `ExperimentalDataset`: future file URI and provenance metadata. Import API is deferred.
- `ValidationRun`: links future jobs to real experimental datasets and metrics. Validation API is deferred.

`migrations/versions/0001_foundation.py` contains a frozen schema copy independent of future application metadata. Migration tests upgrade, downgrade and re-upgrade SQLite. Future revisions should use explicit Alembic schema operations without editing this revision.

## Replaceable scientific modules

All modules expose `Module.evaluate(configuration)` and currently raise `UnsupportedPhysics`. `PhysicsModule` and `ScientificRunner` are structural protocols. They establish responsibility boundaries; future spatial-state and mesh contracts must be designed in Phases 3–5.

| Module | Later responsibility |
| --- | --- |
| physics/electrochemistry.py | Zn/Ce/HER/OER kernels with verified sign conventions |
| physics/species_transport.py | Conservative species diffusion/migration/convection |
| physics/fluid_flow.py | Laminar negative channel flow and positive Darcy flow |
| physics/membrane_transport.py | Donnan jumps and proton-only interface fluxes |
| physics/reservoir_balances.py | Shared cell/tank flux and inventory conservation |
| physics/numerical_integration.py | Coupled residuals, time integration and cycle events |
| physics/efficiency.py | Explicit charge/voltage/energy conventions |
| physics/validation.py | Conservation, refinement and real-data comparisons |
| physics/sensitivity.py | Verified scenario sweeps with failed-run handling |
| physics/optimization.py | Objectives and bounds within validated operating scope |
| physics/reports.py | Evidence-based results reports |

Replace `FoundationRunner` only after local kernels, coupled balances and numerical convergence are verified. `create_app(runner=..., executor_factory=...)` supports injection and infrastructure testing. Do not turn successful API tests into claims of scientific accuracy.

## Source inspection and integration repairs

Reviewed the RAR source, five Phase 0 documents, Phase 1 types/client/configuration logic, project overview DOCX, 15-page paper text, pasted chat and HTML chat (including the full Phase 2 prompt). The source baseline values were cross-checked against paper Tables 1 and 3; no material properties or experimental datasets were guessed.

The supplied source imports missing `src/App.tsx` and `src/styles.css`, and its Vite test setup points to missing `src/test/setup.ts`. These were added to make the package runnable while retaining the supplied feature components. A Plotly resize type error and HTTP issue severity inference error were fixed. The HTTP client can be selected with Vite environment variables. A backend jobs/persistence panel demonstrates submission and polling. Existing local case comparison, CSV imports and analysis empty states remain available.

Phase 0 documents are preserved, including their historical “planning only” statements. This file records the current implementation status. No claim is made to reconstruct missing original UI styling exactly.
