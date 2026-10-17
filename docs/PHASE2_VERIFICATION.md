# Phase 2 verification

Verified on 17 October 2026 with Python 3.12, FastAPI 0.141.1, Pydantic 2.13.5, SQLAlchemy 2.1.5, Alembic 1.20.0, NumPy 2.1.1, SciPy 1.14.1, Vite 6.4.4 and Vitest 3.2.7. The frontend uses the supplied npm lockfile. Python requirement ranges specify compatible dependencies; these exact versions describe the verification environment rather than an exhaustive frozen environment.

| Check | Result |
| --- | --- |
| Backend pytest | 30 passed |
| Frontend Vitest | 8 passed across 3 files |
| TypeScript project build | Passed |
| ESLint | Passed, no errors or warnings |
| Vite production build | Passed; Plotly bundle size warning |
| ZIP CRC and content manifest | Checked during packaging |

Backend coverage: metadata endpoints, source baseline/seed warnings, explicit SI conversions, invalid values/units/settings, non-finite JSON rejection, persistent snapshots, stable configuration hashes and unique job IDs, case persistence, migration upgrade/downgrade, queued-job restart, interrupted-running-job recovery, honest unsupported failure, replacement-runner infrastructure completion, module unsupported errors, CORS and compressed artifact round trips/path containment.

Frontend coverage: source-unit HTTP submission, error handling, malformed capability rejection, persisted job failure decoding, explicit mock behavior, baseline warnings, invalid geometry/porosity, and rendered dashboard-to-configuration navigation.

The artifact test initially encountered a Windows sandbox temporary-directory rename restriction. It passed using a workspace-local pytest base directory. Production code retains atomic replacement of completed NPZ files; no unsafe fallback was added.

Two dependency deprecation warnings were emitted by the existing FastAPI/Starlette test environment. The Vite build reports that the lazily imported Plotly bundle is larger than 500 kB. These do not fail tests or compilation.

## Limits of the evidence

No numerical battery solver, experimental validation, convergence study or calculated battery result is included. Runner success in one test uses a clearly marked infrastructure fixture, not scientific data. No Docker container or live PostgreSQL server was available for execution checks. No full browser visual-regression audit was performed; the frontend was component-tested, type-checked, linted and built. The in-process executor is limited to one API process and is not a durable production worker.

## Commands

From backend: `python -m pytest -q --basetemp <workspace-test-directory>`.
From project root: `vitest run`, `eslint .`, `tsc -b`, `vite build` using the installed local tools. Equivalent npm commands are in README.md. SQLite databases were migrated before TestClient startup. Dependency downloads for verification were placed in task-local tooling directories and are not bundled.
