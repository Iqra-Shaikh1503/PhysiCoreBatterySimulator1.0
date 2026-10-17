# Phase 2 API contract

All endpoints are unprefixed to match `src/services/api.ts`. OpenAPI is at `/openapi.json`; interactive documentation is at `/docs`. Request objects reject unknown keys. Non-finite numeric values, negative concentrations, invalid geometry, fractional cycles, invalid modes and inconsistent explicit units return HTTP 422 with `detail` entries containing location, type and message. Scientific scope warnings do not count as successful solver validation.

| Method | Path | Response / purpose |
| --- | --- | --- |
| GET | /health | Database connectivity and phase |
| GET | /capabilities | Infrastructure available; solver and all physics modules unavailable |
| GET | /model-info | Reference, model version, U-01 through U-16 |
| GET | /parameters/baseline | Configuration, source-unit parameter records and warnings |
| GET | /parameters/schema | Pydantic JSON Schema, numeric bounds, units, sources |
| POST | /configurations/validate | Input-only valid/issues review; schema errors return 422 |
| POST | /simulations | Direct Configuration; 202 with jobId, queued status, pollingUrl |
| GET | /simulations | Paginated items/total/limit/offset; limit 1–100, offset ≥0 |
| GET | /simulations/{UUID} | Configuration snapshot, hash, model/runner versions, UTC times, status, error and empty result containers |
| GET | /validation-standards | Planned, unevaluated scientific gates |
| POST | /cases | Name (trimmed 1–80 chars) plus Configuration; 201 with saved case |
| GET | /cases | Saved cases; limit 1–100, offset ≥0 |

IDs are random UUID4 values to distinguish repeated submissions. The SHA-256 configuration hash is deterministic over canonical JSON including defaults, seed and units. Identical configurations produce identical hashes and different job IDs. No solver randomness is executed in Phase 2.

Error codes: `SOLVER_NOT_IMPLEMENTED` (foundation runner), `WORKER_INTERRUPTED` (restart recovery), `EXECUTION_FAILED` (unexpected runner failure). Unknown UUID jobs return 404; malformed UUIDs return 422; a full development queue returns 429; database operation errors return 503. Internal runner exception details are logged, not sent to clients.

Job states are queued → running → completed or failed. The shipped runner always fails as unsupported. A completed state is exercised only with a clearly marked infrastructure fixture in tests. `validationStatus` remains `not-validated` even for that fixture. No automatic experimental comparison occurs.

The `Configuration` body is the supplied Phase 1 values/mode/model/zincInventory/schemaVersion object, plus optional seed and complete units. An absent units map means the fixed schema-version-1 units; mismatched explicit maps are rejected. `zincInventory` remains null because U-03 is unresolved. Maximum cycles 1000 is a software input limit; values above five carry an out-of-scope warning. Strictly positive Ce seeds retain the Phase 1 schema convention; zero-Ce limiting behavior belongs to the later verified solver.
