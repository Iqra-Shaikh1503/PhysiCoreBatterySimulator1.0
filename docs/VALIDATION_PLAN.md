# Physicore Battery Lab Validation Plan

Phase 0 planning only. **No tests have been run against a solver, no experimental data have been fabricated, and no validation result is claimed.** Test IDs below are future requirements linked to [SCIENTIFIC_MODEL.md](SCIENTIFIC_MODEL.md), the [parameter register](PARAMETER_REGISTER.md) and [traceability matrix](IMPLEMENTATION_ROADMAP.md).

## 1 Verification versus validation

Verification asks whether code solves its declared equations correctly. Validation asks whether those equations describe measured battery behavior in the tested conditions. A smooth plot, a converged Newton iteration and matching COMSOL tolerance numbers answer neither question by themselves.

Maintain separate evidence for analytic/manufactured tests, conservation tests, numerical refinement and experimental comparisons. Manufactured forcing or synthetic unit-test inputs are mathematical fixtures; never label them experimental data.

## 2 Future test catalogue

| Test ID | Source/equations | Fixture and expected property |
| --- | --- | --- |
| T-BASELINE | P Tables 1/3/4 pp. 3/7; O §§5–6 | Verify all conversions, 323.15 K, 250 A/m2, 1.083333333e−6 m3/s, 3e−5 m3 each tank, 3600 s, 0.5 V; exactly three primary fitted parameters; reject missing required values |
| T-SOURCE | All catalogue entries | Every equation retains original number/page and transcription; aliases/corrections carry explicit decision record |
| T-NEUTRALITY | E05/B4/B5 | Negative Table 3 composition balances; literal positive seed returns +4 mol charge/m3 residual, not a false pass; accepted altered initialization must document deviation |
| T-FLUX | E02/E11 | Analytic uniform concentration/potential/velocity cases isolate diffusion, migration and convection; sign reverses with charge/field as expected |
| T-TRANSPORT | E01/E02 | Closed no-source domain retains uniform concentration; analytic diffusion decay and advection pulse check rates and flux accounting |
| T-POROUS | E09/E11/E12/E15 | Storage integrates epsilon c; epsilon=1 gives free-solution limit; effective properties use epsilon^1.5 exactly as printed |
| T-FLOW | E03/E04/B1/B2 | Reviewed no-slip channel fixture with analytic steady profile, correct pressure drop and total flux; quantify divergence |
| T-DARCY | E16/E04 | Constant permeability/viscosity slab with linear pressure; analytic velocity and pressure-gradient sign |
| T-CURRENT | E06/E07/E08 | Sum species currents and compare expanded law; convection cancels only for neutral mixture; charge units are A/m2 |
| T-STOICH | E10/B6/B7 | Charging Ce(III) decreases, Ce(IV) increases; total Ce is unchanged; Zn/H+ consumed according to current signs; spectator source zero |
| T-CHARGE | E13/E14/B5/B8 | Applied terminal current equals cross-section total current; equal/opposite solid-to-electrolyte transfer; current continuity at each membrane interface |
| T-OHM | E14/E29 | Slab potential/current solution with explicit gauge and normal orientation; E29 disagreement must be resolved, not patched by absolute values |
| T-NERNST | E19/B6 | Ce unit ratio gives E0; log-ratio increment e gives RT/F; zinc concentration-reference ratio increment e gives RT/(2F); zero/negative inputs fail explicitly |
| T-KINETICS | E18/E28/B6/B7 | Gauge invariance; expected current versus overpotential; exponential evaluation remains finite in declared admissible range |
| T-ZN | B6 | Correct cathodic deposition/anodic dissolution; zero metal prevents anodic dissolution; finite-metal term kept; no invented equilibrium assertion |
| T-INVENTORY | Derived Zn inventory law, U-03 | Once normalization is resolved, integrate a prescribed reaction current and compare Zn moles with Faraday's law; nonnegative inventory |
| T-CE | E17/E20/E21/E23–E26 | Independent local surface-balance solve matches closed expressions and both residuals; zero eta/surface=bulk gives zero current; large k_m approaches bulk values |
| T-MASS-TRANSFER | E22 and D/d approximation | Derived Ce(III) coefficient uses diffusivity ratio; coefficients never fitted independently by accident; depletion response changes predictably |
| T-SIDE | E27/E28/B7 | HER negative, OER positive; phase policy explicit; side currents alter charge allocation, not fictitious Zn/Ce material |
| T-MEMBRANE | E29/B5 | Equal proton concentrations give zero Donnan jump; ratio change e gives RT/F; fixed proton concentration; no non-proton flux; current/proton transfer consistent |
| T-OUTLET | B2 | Zero diffusive flux does not block convective transport; signed outlet flux enters tank; electric end closure reviewed |
| T-RESERVOIR | B1/B3 | Uniform loop stays unchanged; declared tank balance approaches inflow composition; cell–tank exchange cancels from total inventory |
| T-VOLTAGE | E30, ASR/contact data | Correct area/current conversion, reference-potential sampling, charge/discharge sign and zero-current limit; loss components sum without double counting |
| T-CYCLE | B8, P §2 p. 3 | Switch exactly at charge end; terminate on downward 0.5 V crossing; material states continuous, algebraic potentials may jump; independent cycles don't reset composition |
| T-METRICS | O §§28/35, proposed definitions | Constant-current analytic charge/energy integrals; percentage normalization; zero denominators undefined; perfect comparison gives RMSE=MAE=0; R2 undefined for constant measured series |
| T-JACOBIAN | Proposed solver residual | Directional finite differences agree with Jacobian-vector products over an appropriate perturbation range, including tank/interface derivatives |
| T-POSITIVITY | E01/E09/B6 | Near-depletion accepted states have no materially negative concentrations/inventory; rejected steps logged; no clipping-induced mass creation |
| T-MANUFACTURED | Transport/charge/flow kernels | Declared exact smooth solution plus known forcing; measured error decreases with expected discretization order |
| T-REFINE | P §5 p. 7; O §§38–39 | At least three mesh levels and three time controls, independently refined; compare event times, fields, inventories and energy |
| T-PAPER-FIT | P Fig. 2 p. 7/§6.1 p. 8 | Freeze published parameters; reproduce second-cycle observable definitions before comparing with genuine data |
| T-PAPER-CYCLES | P Fig. 3 pp. 8–9 | Five-cycle full/half-cell comparison using declared first-cycle treatment and consistent voltage reference |
| T-PAPER-CE | P Fig. 4c p. 9/§6.1 p. 10 | End-discharge Ce(IV) comparisons cycles 1–4; report cycle-5 precipitation discrepancy separately |
| T-SWEEPS | P Figs. 5–8 pp. 10–14 | Numerical trend comparison for current/mass-transfer/mixed-electrolyte cases; identify as model comparisons unless matched experimental data are available |
| T-SCOPE | O §§41–43; P §6.1 | Published mode carries five-cycle/precipitation limits; changed chemistry/temperature/flow and extensions never inherit baseline validation |
| T-DATA | O §§34–36 | Validate uploaded units, timestamps, phase/cycle/reference metadata; distinguish raw, digitized and synthetic mathematical data |
| T-RESULTS | O §§3–12/44/47 | Stored/visualized results match solver arrays, provenance and units; invalid runs cannot look validated |
| T-OPTIMIZE | O §§32–33 | Deterministic sweep provenance, bounded objectives, failed-run exclusion, uncertainty/scope displayed; recommendations checked with direct reruns |
| T-AI | O §43 | Explanation quotes actual outputs and limitations; cannot invent numerical results or overwrite solver state |

## 3 Conservation checks

**Proposed inventory definitions** (verification identities, not additional paper equations): integrate negative concentration with factor L_w, positive concentration with epsilon L_w, and each tank with V_e. Count metallic Zn using electrode area integration of the resolved surface inventory.

Closed recirculating negative loop:

$$M_{Zn}=V_{e,-}c_{Zn(II),tank}+L_w\int_{\Omega_-}c_{Zn(II)}\,dA+L_w\int_{\Gamma_-}\Gamma_{Zn}\,ds.$$

Closed positive loop:

$$M_{Ce}=V_{e,+}(c_{III,tank}+c_{IV,tank})+L_w\int_{\Omega_+}\epsilon(c_{III}+c_{IV})\,dA.$$

These should remain constant in the no-sampling/no-precipitation published mathematical system. Spectator methanesulfonate inventories should also remain constant in each loop. Tank-only concentration changes are insufficient evidence.

Do **not** require H+ alone to remain constant: HER consumes it, OER generates it, and the membrane transfers it. Its residual must equal integrated reaction sources and any external sampling/removal. Compare membrane fluxes with equal/opposite contributions to the two electrolyte inventories.

Charge checks: integrate all Faradaic currents with the correct surface or volume-area factor. Positive current includes Ce+OER and negative current Zn+HER, mapped to a common orientation. Every cross-section's total current must match the applied current. Side-reaction current cannot be counted as stored Zn/Ce charge.

P §2 p. 3 removes a 0.2 cm3 positive-electrolyte sample after each cycle. Whether this volume/composition removal was represented computationally is not specified. Experimental inventory comparisons must document any sampling corrections; the mathematical no-sampling conservation test is separate.

## 4 Error metrics and numerical acceptance

O §35 requests:

$$RMSE=\sqrt{\frac1N\sum_{\ell=1}^N(y_\ell-\hat y_\ell)^2},\quad
MAE=\frac1N\sum_{\ell=1}^N|y_\ell-\hat y_\ell|,\quad
R^2=1-\frac{\sum_\ell(y_\ell-\hat y_\ell)^2}{\sum_\ell(y_\ell-\bar y)^2}.$$

Report units for RMSE/MAE and sampling/weighting for each metric. Distinguish pointwise sample-weighted error from time-weighted error on uneven timestamps. R2 may be negative; it is undefined when measured variance is zero. Do not pool volts and concentrations in one unscaled metric.

**Proposed preliminary verification targets**, not P settings, measured results or accuracy guarantees:

| Check | Planning target | Qualification |
| --- | --- | --- |
| Unit conversions / analytic scalar kernels | Near machine precision with scale-aware comparison | Include analytic conditioning/roundoff |
| Closed inventory drift | ≤1e−6 relative to declared initial inventory | Refine until drift trends downward; use a nonzero scale for empty inventory |
| Neutrality and current balance | ≤1e−6 in declared normalized norms | Define normalization; cannot falsely pass literal seed state |
| Last two refinement levels | ≤1% change in discharge duration/energy and ≤5 mV voltage away from jumps | Tighten according to intended research use; not sufficient for experiment agreement |
| Positivity | No negative state beyond documented rounding allowance | Allowance expressed in physical units, never a hidden concentration floor |

These targets must be reviewed on benchmark conditioning before being used as release gates. Experimental acceptance limits should follow measurement and digitization uncertainty; none is fabricated here.

## 5 Published comparison plan

| Evidence | Paper location | Future comparison and limitation |
| --- | --- | --- |
| Fitted second-cycle full-cell curve | Fig. 2 p. 7, discussion p. 8 | Compare charge/discharge curves, timing and termination with primary fitted parameters fixed |
| Five-cycle cell voltage | Fig. 3a p. 8 | Per-cycle time/voltage/capacity; no independent time stretching to hide drift |
| Positive and negative potentials | Fig. 3b p. 8; explanation p. 9 | Reference electrodes near inlets; define reference conversion and reported 0.24 Ω negative collector correction first |
| Zn(II) and Zn surface inventory | Fig. 4a/b p. 9 | These panels are computed model behavior, not independent measured concentration/inventory time series |
| Ce(IV) titration | Fig. 4c p. 9 | Genuine experimental comparison through cycle 4; endpoint defined after discharge |
| Fifth-cycle discrepancy | §6.1 p. 10 | About 0.27 M experimental versus 0.31 M model; precipitation explanation; outside the quoted <5% comparison claim |

P's reported <5% Ce(IV) deviation is an author-reported result for its comparison range. It is not a general voltage error bound or a validated result of Physicore.

Additional **published model results**, for later trend/regression comparisons only:

| Case | Author-reported outcome | Source and comparison caution |
| --- | --- | --- |
| 15 /25 /35 mA cm−2 | Five-cycle average charge efficiencies about 70 /75 /79%; voltage efficiencies about 88 /83 /79% | P §6.2 p. 11; these are reported model-study outcomes, not new application measurements |
| Single-cycle Ce mass transfer increased from 2.8e−5 to 2.8e−4 m s−1 | Voltage efficiency about 78% to 86% | P §6.3 p. 12; do not compare this single-cycle 78% directly with five-cycle baseline 83% |
| 60 mA cm−2 and baseline versus increased Ce transfer | Limiting process changes from Ce transfer to Zn stripping | P §6.3 pp. 12–13/Fig. 7 |
| Mixed versus pure-MSA negative electrolyte | Charge efficiency about 75% to 80%, voltage efficiency about 83% to 85% | P §6.4 p. 13; mixed chemistry remains blocked by U-14 |

P §6.2 p. 12 also reports first-charge Ce(III) fractional conversions of 31%, 43% and 56% at 25, 35 and 45 mA cm−2. Treat these as reported predictions under the paper's scenario definitions; do not infer an experimental dataset from them.

## 6 Data acquisition and integrity

Preferred: obtain original full-cell, half-cell and titration datasets plus cell/reference metadata and, if possible, the COMSOL model. None is present as a machine-readable dataset in the supplied attachments.

If raw data cannot be obtained, later digitization is acceptable only with provenance: source figure/page/panel, which curve is experimental, axis calibration, extraction method, estimated digitization uncertainty, and reviewer check. Fig. 2/3/4 legends must be inspected panel by panel; never label fitted/computed points as experiments. No digitization has been performed in Phase 0.

Data records should include time [s], cell voltage [V], current [A], phase/cycle, concentration units and sampling time, electrode potential reference, temperature, flow, composition and geometry. Preserve uploaded originals and a documented processed copy. Handle duplicates, missing values and out-of-order timestamps explicitly. Align by physical phase events; compare on a common time grid without extrapolating beyond available measurements.

Fit only to declared training data (paper's primary fit is cycle 2). Keep cycles/observables used for assessment separate from new calibration. Report uncertainty and parameter identifiability; a manual one-at-a-time fit does not prove uniqueness. A new refit is a separate experiment and cannot replace an unsuccessful fixed-parameter reproduction silently.

## 7 Refinement protocol

1. Verify local equation/flux/Jacobian kernels.
2. Establish spatial convergence on analytic/manufactured problems with very tight temporal error.
3. Establish time convergence on a fixed fine mesh.
4. Refine negative channel, porous electrode and thin membrane independently; report degrees of freedom and smallest cell size as well as element count.
5. Repeat coupled baseline with at least three mesh/time levels. Record minima, surface gradients, current continuity, total inventories, voltage/energy and cutoff time.
6. Tighten nonlinear/linear tolerances independently to ensure iteration error is smaller than discretization differences.
7. Compare the numerically converged declared model with experiments. Do not “tune the mesh” to obtain a fortuitous experimental fit.

Near current switches compare left/right phase values; near cutoff compare the event time and pre-cutoff trajectory. Do not compare only interpolated end voltage, which is forced by the 0.5 V event.

## 8 Evidence record and release status

Each future test report should contain test ID, source/model version, parameter hash and deviations, input provenance, solver/platform versions, mesh/time settings, unresolved assumptions, residual/conservation statistics, comparison files, expected/actual values, acceptance criterion and status.

Status may be planned, blocked by scientific decision/data, executed-pass, executed-fail or inconclusive. **Every test in this document is currently planned; experimental comparisons additionally depend on raw data or reviewed digitization.** Numerical agreement on a reduced model cannot validate a full 2-D implementation.
