# Physicore Battery Lab Implementation Roadmap

Phase 0 defines the scientific contract and future work. Only these five Markdown specifications are delivered. Module names and interfaces below are proposals; no production code, solver, API, database or frontend has been created.

## 1 Specification package

| File | Purpose |
| --- | --- |
| [SCIENTIFIC_MODEL.md](SCIENTIFIC_MODEL.md) | Printed equations E01–E30, unnumbered conditions B1–B8, assumptions, product differences, unresolved science U-01–U-16 |
| [PARAMETER_REGISTER.md](PARAMETER_REGISTER.md) | Original/SI units, source locations, fitted/measured/adopted values, conditional derived quantities, missing properties |
| [NUMERICAL_METHOD.md](NUMERICAL_METHOD.md) | Independent Python discretization and solver options, proposed strategy, limitations |
| [VALIDATION_PLAN.md](VALIDATION_PLAN.md) | Future tests T-*, conservation/refinement, real-data comparison and evidence policy |
| This document | Stages, dependency boundaries, module contracts and requirement traceability |

P and O source definitions and original-file links are in SCIENTIFIC_MODEL §1. No external literature cited in P has been silently imported as another scientific authority.

## 2 Architecture and responsibility boundaries

Keep the scientific core importable and testable without a web server or database. Beginner-friendly principle: the same calculation should give the same result whether invoked by a unit test, a command-line research run or a future dashboard.

| Proposed module | Responsibility | Depends on |
| --- | --- | --- |
| core.units / core.parameters | Unit conversion, immutable paper preset, provenance, validated scenarios and missing-value checks | Register |
| core.species / core.stoichiometry | Species charges, electron counts, signed reaction/flux map | E05/E10/B6/B7, U-09 resolution |
| core.geometry | Semantic domain/boundary tags, 2-D width conversion | Table 1/Fig. 1, U-01 |
| physics.transport | Species fluxes/storage and ionic-current expressions | E01/E02/E05–E12 |
| physics.flow | Negative incompressible flow and positive Darcy flow | E03/E04/E16, material properties |
| physics.zinc / physics.cerium | Local reaction laws, surface state and Ce transfer | B6/E17–E26 |
| physics.side_reactions | HER/OER currents and phase policy | B7/E27/E28 |
| physics.membrane | Donnan jump, proton-only flux/current | E29/B5, U-02 |
| physics.reservoirs | Tank inventories and inlet/outlet coupling | B1/B3, U-05 |
| numerics.mesh / numerics.assembly | Discretization and residual/Jacobian construction | Geometry and physics contracts |
| numerics.nonlinear / numerics.time | Sparse solves, timestep control, consistent constraints and events | Coupled residual |
| analysis.voltage / analysis.metrics | Voltage/reference conversion, loss accounting, charge/energy/error metrics | Solved states, U-06/U-07/U-13 |
| analysis.diagnostics | Limiting-process evidence, inventories, convergence and scope flags | Fields and residuals |
| experiments.data / experiments.compare | Genuine data import, provenance, digitization labels and comparison | Validation plan |
| studies.sensitivity / studies.optimization | Versioned scenario sweeps, objective evaluation, failed-run handling | Verified solver and scope policy |
| results.storage / results.reports | Reproducible artifacts, metadata, reports and saved experiments | Result contract |
| service.jobs / service.api | Validated request submission, progress, cancellation, retrieval | Headless scientific runner |
| frontend | Inputs, plots, maps, battery visuals, comparisons, quality/status views | API/result contract |
| assistant.explanations | Read-only explanations grounded in outputs and limitations | Verified result/diagnostic records |
| extensions | Explicit new physics, parameters and validation scope | Separate scientific specifications |

Physics functions must not query UI state. A discretization backend evaluates declared physics instead of redefining it. The result contract must distinguish paper preset, modified scenario and extended model.

**Proposed data contracts:** a scenario contains model version, mode, physical constants convention, parameter values/units/provenance, initial state, boundary map, phase rules, mesh/time controls and declared deviations. A run result contains accepted times, phase/cycle, spatial fields or references to them, tank states, Zn inventory, reaction currents, extracted voltages, metrics, event times, diagnostics and failure/scope status. Missing data remain missing.

## 3 Staged implementation

### Milestone 1 — Scientific inputs and local equation verification

Recommended first implementation milestone after Phase 0 acceptance.

Implement only the unit/provenance/species/baseline layer and small local kernels whose interpretation is unambiguous: Nernst potentials, Nernst–Planck flux components, porous corrections, Ce surface balances and selected side-reaction formulas. Use explicitly mathematical fixtures, not fabricated experiments.

Acceptance: T-BASELINE, T-SOURCE, T-FLUX, T-NERNST, T-POROUS, T-CE, T-MASS-TRANSFER and relevant T-KINETICS pass; the literal positive seed fails exact neutrality visibly as expected. Fitted status is preserved, SI conversions are tested, undefined logarithms/divisions are handled explicitly. No full-cell prediction or validation badge is produced at this stage.

Dependencies: these five specs; a declared constants convention and Python environment. Avoid claiming complete Zn/membrane behavior until U-02/U-03 are resolved. The unresolved full-model questions need not prevent unambiguous local-kernel tests.

### Milestone 2 — Resolve closures and conservative transport reference

Resolve/document U-01–U-09: coordinates, signs, normals, Zn normalization and initial state, seed neutrality, voltage/reference accounting, material properties and missing boundary/charge-transfer closures. Obtain original COMSOL details or author/source clarification where possible. Any adopted engineering closure must carry a deviation record and its validation evidence.

Implement a headless one-dimensional conservative cell–tank transport benchmark with no reactions, then reaction-coupled small cases. Compare finite-volume reference fluxes against analytic/manufactured solutions.

Acceptance: T-TRANSPORT, T-CURRENT, T-RESERVOIR, T-OUTLET, T-STOICH, T-CHARGE and T-JACOBIAN on the declared benchmark; global inventories close. Signed interface conditions and all required properties have explicit definitions.

### Milestone 3 — Coupled electrochemistry and cycle controller

Add Zn inventory, Ce transfer, HER/OER, membrane jump/current, algebraic potential constraints, cell voltage and event handling in reduced verified configurations. Start backward Euler and a sparse direct linear reference; evaluate stronger solvers only as size requires.

Acceptance: T-ZN, T-INVENTORY, T-SIDE, T-MEMBRANE, T-OHM, T-VOLTAGE, T-CYCLE, T-METRICS and T-POSITIVITY. Record conservation, residuals and event convergence. Label outputs as reduced-model verification results, not paper reproduction.

Dependencies: Milestones 1–2 and resolution of voltage/Zn/membrane issues. U-11 first-cycle treatment must be decided before baseline multi-cycle interpretation.

### Milestone 4 — Full two-dimensional model

Set up tagged negative, membrane and positive domains; negative Navier–Stokes and positive Darcy flow; assemble coupled transport/charge/kinetics with surface and volume reactions kept distinct. Recommended research route: DOLFINx/PETSc full model with a small independent conservative reference. A SciPy finite-volume route remains an explicitly different discretization if selected.

Acceptance: T-FLOW, T-DARCY, T-MANUFACTURED, T-REFINE, T-CHARGE, T-RESERVOIR and T-POSITIVITY across mesh/time levels. Verify thin-membrane/interface treatment and material conservation over multiple cycles before experimental claims.

Dependencies: compatible verified platform, complete physical closures and reproducible numerical configuration. Paper mesh/tolerances are comparison metadata, not acceptance criteria.

### Milestone 5 — Published-data comparison

Acquire original measurements or reviewed figure digitization (U-12). Freeze published parameters for reproduction and define electrode references, sampling and first-cycle behavior. Compare fitted cycle 2, full/half-cell curves and Ce(IV) endpoints as distinct observables. Any new fit is a separately named study with its own calibration/holdout split.

Acceptance: T-DATA, T-PAPER-FIT, T-PAPER-CYCLES and T-PAPER-CE executed with recorded numerical uncertainty and genuine data provenance. Report pass/fail/inconclusive using declared criteria; do not promise paper accuracy or a successful match.

Dependencies: Milestone 4 numerically converged solution; U-06/U-07/U-11/U-12/U-13 sufficiently resolved. If raw data are unavailable, distinguish visual/digitized agreement from raw-data validation.

### Milestone 6 — Workstation interface and persistence

Add API, background simulation jobs, saved scenarios/results and frontend. Show baseline controls, charge/discharge graphs, species maps, flow visualization, reaction allocation, cycle comparisons and quality diagnostics. Keep potentially long simulations out of the interactive request path; progress and cancellation must preserve correct status.

Preferred technologies from O §46: React/TypeScript/Tailwind; Plotly, Three.js and D3 only where useful; Python/FastAPI, NumPy/SciPy/pandas/Pydantic. The database choice is not specified and can be selected when storage/field sizes are measured.

Acceptance: T-RESULTS, T-DATA, T-SCOPE and T-METRICS through API/UI. Visual values come from result data; no static “validated” efficiencies or invented animations representing nonexistent simulation fields. Internal solver details belong in a technical view/export, while users see actionable quality/status information.

Dependencies: verified result contract and credible numerical output. A frontend preview can be developed earlier only if clearly labelled illustrative and separated from simulation results; this is optional, not the scientific priority.

### Milestone 7 — Studies, reports, explanations and extensions

Add sensitivity and optimization, research reports, saved design comparisons and explanatory assistant. Collect new sources for precipitation, water/ion crossover, bubbles, temperature-dependent properties and long-term degradation. Specify and validate each extension before enabling it as an established capability.

Acceptance: T-SWEEPS, T-OPTIMIZE, T-AI, T-RESULTS and T-SCOPE. Reproduce trends from P separately from experimental validation. An optimum is conditional on objectives, constraints, domain, model uncertainty and parameter dependence.

Dependencies: scientific/numerical baseline with documented scope. Extended Model is versioned separately; no unknown precipitation rate law, Arrhenius activation energy or \(k_m(Q)\) correlation is guessed.

## 4 Dependency and release rules

Milestone 1 precedes coupled benchmarks; conservative benchmarks and resolved closures precede full 2-D simulation; numerical convergence precedes experimental accuracy claims; credible outputs precede research optimization. UI can progress in parallel later against a fixed schema, without implying an unfinished model is validated.

Every result must state one of: analytic verification fixture, reduced-model result, unvalidated full-model prediction, comparison with published data, or validated condition-specific run. A failure remains a failure/inconclusive record, not a rendered success plot.

Gate unresolved issues by relevance. Missing density blocks meaningful Navier–Stokes execution, but not a scalar Ce Nernst test. Missing raw measurements block experimental validation, but not conservation benchmarks. Record the reason precisely without blocking unrelated safe progress.

## 5 Traceability matrix

Every major scientific requirement and product group maps to its source, future module and future test. E/B identifiers retain source locations in SCIENTIFIC_MODEL; O section labels refer to the actual overview headings. T IDs are planned, not executed.

| Requirement | Source | Proposed module | Future verification/validation |
| --- | --- | --- | --- |
| Two-dimensional physical system | P §§2–3 pp. 2–4, Fig. 1/Table 1; O §11 | core.geometry | T-BASELINE, T-SOURCE, T-REFINE |
| Negative open electrolyte domain | P §3.1 p. 3, E01–E08 | physics.transport / flow | T-TRANSPORT, T-FLOW |
| Positive porous domain | P §3.2 pp. 4–5, E09–E16 | physics.transport / flow | T-POROUS, T-DARCY |
| Species sets and editable composition | P §§3.1/3.2/Table 3; O §6 | core.species / parameters | T-BASELINE, T-NEUTRALITY |
| Diffusion/migration/convection | P E02/E11; O §§14/30–31 | physics.transport | T-FLUX, T-TRANSPORT |
| Negative mass conservation | P E01 | physics.transport | T-TRANSPORT, T-RESERVOIR |
| Porous mass conservation/reaction sources | P E09/E10 | physics.transport / stoichiometry | T-POROUS, T-STOICH |
| Incompressible flow/continuity | P E03/E04/E16; O §§12/15–16 | physics.flow | T-FLOW, T-DARCY |
| Electroneutrality and ionic currents | P E05–E08 | core.species / physics.transport | T-NEUTRALITY, T-CURRENT |
| Positive electronic conduction/charge | P E13–E15 | physics.transport / assembly | T-CHARGE, T-OHM |
| Finite Zn deposition/dissolution | P B6/Table 2/Fig. 4b; O §19 | physics.zinc | T-ZN, T-INVENTORY |
| Cerium kinetics/Nernst | P E17–E19; O §20 | physics.cerium | T-NERNST, T-CE |
| Surface mass transfer | P E20–E26; O §24 | physics.cerium | T-CE, T-MASS-TRANSFER |
| HER/OER allocation | P E27/E28/B7; O §§22–23 | physics.side_reactions | T-SIDE, T-STOICH |
| Effective porous properties | P E12/E15; O §§16–17 | physics.transport | T-POROUS |
| Proton membrane/Donnan | P E29/B5; O §25 | physics.membrane | T-MEMBRANE, T-OHM |
| Tank dynamics/recirculation | P B1/B3; O §26 | physics.reservoirs | T-RESERVOIR |
| Cell voltage/losses | P E30/§6.1 p. 9; O §27 | analysis.voltage | T-VOLTAGE, T-PAPER-FIT |
| Charge/discharge rules | P §2 p. 3/B8; O §5 | numerics.time | T-CYCLE |
| Efficiency definitions | O §28; P §6.2 pp. 10–11 results | analysis.metrics | T-METRICS |
| IC/BC/baseline/fitted provenance | P Tables 1–4; O §§5–7 | core.parameters / geometry | T-BASELINE, T-SOURCE |
| COMSOL metadata/independent Python solve | P §5 p. 7; O §36/46 | numerics | T-JACOBIAN, T-MANUFACTURED, T-REFINE |
| Numerical quality warnings | O §37 | analysis.diagnostics / frontend | T-CHARGE, T-NEUTRALITY, T-POSITIVITY, T-RESULTS |
| Mesh and adaptive time refinement | P §5; O §§38–39 | numerics.mesh / time | T-REFINE, T-CYCLE |
| Experimental fitting/validation | P §§2/5/6.1, Figs. 2–4; O §§34–36 | experiments.compare | T-PAPER-FIT, T-PAPER-CYCLES, T-PAPER-CE |
| Accuracy metrics | O §35 | analysis.metrics | T-METRICS, T-DATA |
| Assumptions/scope/precipitation | P §3 p. 3/§6.1 pp. 9–10; O §§41–42 | core.parameters / extensions | T-SCOPE |
| Dashboard and basic controls | O §§3–5/49 | frontend / service.api | T-RESULTS, T-BASELINE |
| Battery charge/discharge visualization | O §§8–10 | frontend | T-RESULTS, T-CYCLE |
| Concentration maps/flow visualization | O §§11–12 | frontend / results.storage | T-RESULTS, T-FLOW |
| Electrochemistry/transport/cycle views | O §4/40 | frontend / analysis.diagnostics | T-RESULTS, T-INVENTORY |
| Current/flow/temperature sensitivity | O §§30–32; P §§6.2–6.4 | studies.sensitivity | T-SWEEPS, T-SCOPE |
| Optimization | O §33 | studies.optimization | T-OPTIMIZE |
| Uploaded experiments/overlay comparisons | O §34/36 | experiments.data / frontend | T-DATA, T-PAPER-CYCLES |
| Cycle accumulation versus lifetime | O §§40–42; P §6.1 | analysis.diagnostics / extensions | T-PAPER-CE, T-SCOPE |
| AI explanation | O §43 | assistant.explanations | T-AI |
| Research report export | O §44 | results.reports | T-RESULTS, T-SOURCE |
| Backend modularity | O §45 | Scientific core / numerics / analysis | All component tests; headless execution gate |
| Technology/API/frontend separation | O §46/48 | service.api / jobs / frontend | T-RESULTS, T-DATA |
| Saved runs/designs/database/comparisons | O §47/51 | results.storage | T-RESULTS |
| Published versus extended modes | O §41; P model limits | core.parameters / extensions | T-SCOPE |
| No automatic accuracy claim | O §50; current request | experiments.compare / reports | T-SCOPE, T-RESULTS |

## 6 What remains before full implementation

U-01–U-09 cover the highest-impact scientific closures: coordinates, sign/normal maps, Zn state, charge-consistent initialization, missing properties, source terms and voltage extraction. U-11/U-12/U-13 block exact first-cycle/measurement/efficiency reproduction. U-14 applies to mixed chemistry; U-15 limits COMSOL equivalence; U-16 covers extensions and parameter extrapolation.

The immediate milestone is a tested scientific-input and local-equation library. It provides useful learning feedback and a reviewable foundation while the exact published-model ambiguities are resolved. A production cell solver comes only after those contracts and their conservation tests are concrete.
