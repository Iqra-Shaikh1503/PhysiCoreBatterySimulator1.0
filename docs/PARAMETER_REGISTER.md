# Physicore Battery Lab Parameter Register

Phase 0. Source codes P and O, equation identifiers E01–E30, boundary sets B1–B8 and unresolved IDs U-01–U-16 are defined in [SCIENTIFIC_MODEL.md](SCIENTIFIC_MODEL.md). Paper references [25], etc. below are P's own bibliography numbers (p. 15); their underlying publications were not independently checked. No fitted values have been recalibrated.

## Register policy

**Published operating/initial**, **published geometry**, **literature adopted**, **literature interpolated**, **fitted**, **measured**, **derived proposal**, and **unresolved** are different provenance categories. A number called a “constant” in Table 4 remains conditional on temperature, electrolyte, electrode and cell construction. Only physical constants F and R are universal here.

The future parameter schema should store symbol/name, original value/unit, SI value/unit, source/equation/page, provenance, fit dataset/cycle, context, uncertainty if reported, allowed edit policy and model version. Missing uncertainty is “not reported”, never zero. A UI edit creates a new scenario; it does not modify the immutable published preset.

## Operating conditions and geometry

| ID / quantity | Symbol | Published value and unit | SI representation | Source | Status and use |
| --- | --- | --- | --- | --- | --- |
| P01 Temperature | T | 50 °C | 323.15 K | P §2 p. 3, Table 3 p. 7; O §5 | Operating; kinetic/transport coefficients are at this temperature |
| P02 Applied current density | i_app | 25 mA cm−2 | 250 A m−2 | Same | Operating; B8, magnitude with separate phase sign |
| P03 Flow per electrolyte loop | Q | 65 mL min−1 | 1.083333333e−6 m3 s−1 | Same | Operating; B1/B3; not electrical charge |
| P04 Each reservoir volume | V_e | 30 cm3 | 3e−5 m3 | Same | Operating; two reservoirs, not 30 cm3 combined |
| P05 Charge duration | t_charge | 1 h | 3600 s | P §2 p. 3, Fig. 2 p. 7; O §5 | Operating phase control B8 |
| P06 Discharge cutoff | V_cut | 0.5 V | 0.5 V | P §2 p. 3 | Operating event; not fixed discharge duration |
| P07 Study horizon | cycles | 5 | 5 cycles | P §6.1 pp. 8–10; O §§40–42 | Scope, not precipitation-free guarantee |
| G01 Electrode height | H | 45 mm | 0.045 m | P Table 1 p. 3 | Geometry; y extent |
| G02 Out-of-plane width | L_w | 20 mm | 0.020 m | Same | Geometry; B1/B3 and area conversion |
| G03 Positive porosity | epsilon | 0.758 | 0.758 | Same | Geometry/material property; E09/E12/E15 |
| G04 Positive volumetric area | a | 150 m−1 | 150 m−1 | Table 1 footnote a p. 3; §§5/6.1 pp. 7–8 | **Fitted**, second-cycle calibration; E10 |
| G05 Flow channel thickness | L_f | 6 mm | 0.006 m | Table 1 p. 3 | Geometry; each compartment |
| G06 Membrane thickness | L_m | 180 μm | 1.8e−4 m | Same | Geometry; Nafion 117 |
| G07 Apparent active dimensions | — | 2 × 4.5 cm | Area 9e−4 m2, derived | P §2 p. 3 | Physical area; not a and not total mesh internal area |
| G08 Pt loading | — | 7 mg cm−2 | 0.07 kg m−2 | P §2 p. 2 | Experimental assembly; no independent PDE coefficient |
| G09 Positive mesh construction | — | Four 1.5 mm layers | 4 × 0.0015 m | P §2 pp. 2–3 | Physical assembly |
| G10 Ti plate / PVE thickness | — | 6 mm each | 0.006 m | P §2 pp. 2–3 | Physical solids; do not treat as extra electrolyte layers |
| P08 Positive outlet pressure | P_out,pos | **100 Pa** | 100 Pa | Table 3 p. 7 [39] | Published boundary value; B2 |
| P09 Negative outlet pressure | P_out,neg | 0 Pa | 0 Pa | Table 3 p. 7 | Published boundary value; B2 |

Proposed coordinate values from G05/G06: x1=0.006 m, x2=0.00618 m, x3=0.01218 m (SCIENTIFIC_MODEL §2; U-01). These are calculated domain coordinates, not a transcription of Table 2's inconsistent negative-region inequalities.

## Initial aqueous composition

All rows are P Table 3 p. 7, corresponding to O §6; uniform fields in B4 and initial tank compositions proposed consistently.

| ID / species | Symbol | Printed mol dm−3 | SI mol m−3 | Status |
| --- | --- | --- | --- | --- |
| C01 Negative Zn(II) | c0_Zn(II) | 1.5 | 1500 | Published initial composition |
| C02 Negative H+ | c0_H+,neg | 1 | 1000 | Published initial composition |
| C03 Negative CH3SO3− | c0_anion,neg | 4 | 4000 | Published initial composition |
| C04 Positive Ce(III) | c0_Ce3+ | 0.8 | 800 | Published initial composition |
| C05 Positive Ce(IV) | c0_Ce4+ | 0.001 | 1 | **Numerical regularization seed**, physical initial Ce(IV) described as zero in §5 p. 6 |
| C06 Positive H+ | c0_H+,pos | 4 | 4000 | Published initial composition |
| C07 Positive CH3SO3− | c0_anion,pos | 6.4 | 6400 | Published initial composition |

**U-04:** literal negative charge balance is 2(1.5)+1−4=0 mol charge dm−3. Literal positive balance is 3(0.8)+4(0.001)+4−6.4=+0.004 mol charge dm−3 (=4 mol charge m−3). The numerical seed is incompatible with exact neutrality if all other printed concentrations are held fixed. Do not silently change C04/C06/C07. Any initialization that recomputes one dependent species must retain original and adjusted values plus rationale.

## Transport and material properties

| ID / property | Symbol | Published value/unit | SI value/unit | Source | Provenance and coupling |
| --- | --- | --- | --- | --- | --- |
| D01 Zn(II) diffusivity | D_Zn(II) | 1.165e−9 m2 s−1 | Same | Table 4 p. 7 [25] | Literature adopted at 50 °C; E02/E08 |
| D02 Proton diffusivity | D_H+ | 1.230e−8 m2 s−1 | Same | Table 4 [40] | Literature adopted at 50 °C; E02/E11 |
| D03 Ce(III) diffusivity | D_Ce(III) | 1.520e−10 m2 s−1 | Same | Table 4 [27] | Literature adopted at 50 °C; E11/E22 |
| D04 Ce(IV) diffusivity | D_Ce(IV) | 1.075e−10 m2 s−1 | Same | Table 4 [41], footnote a | Literature **interpolated** to 50 °C; E11/E22 |
| D05 Methanesulfonate diffusivity | D_anion | 2.378e−9 m2 s−1 | Same | Table 4 [42] | Literature adopted at 50 °C; E02/E11 |
| M01 Positive solid conductivity | sigma_s,pos | 2e6 S m−1 | Same | Table 4, footnote b | Ti conductivity; no separate bibliographic marker in row; E14/E15 |
| M02 Membrane conductivity | sigma_m | 15.95 S m−1 | Same | Table 4 [43], footnote a | Literature interpolated to 50 °C; E29 |
| M03 Pt/Ti permeability | k_kc | 7.1e−4 cm2 | **7.1e−8 m2** | Table 4 [39] | Literature adopted; E16 |
| M04 Fixed sulfonate sites | c_f | 1.2 mol dm−3 | 1200 mol m−3 | Table 4 [51] | Literature adopted; B5 |
| M05 Fixed-site charge | z_f | −1 | −1 | Table 4 | Membrane chemistry; B5 |
| M06 Area resistance | ASR | 4.5e−4 Ω m2 | Same | Table 4 [31], Eq. 30 discussion p. 6 | Measured/EIS-associated cell property inherited from prior study; U-06 |
| M07 Carbon–collector resistance | R_contact | Approximately 0.24 Ω | Same | P §6.1 p. 9 | Directly measured for half-cell potential comparison; not interchangeable with ASR |

Footnote a in Table 4 marks interpolated Ce(IV) diffusivity, membrane conductivity and OER exchange current. Footnote b identifies the conductivity of Ti. Footnote c identifies fitted HER exchange current and Ce(IV) mass transfer. Table 1 separately marks fitted area.

## Electrochemical properties

All values below are from P Table 4 p. 7 unless noted. Printed alpha labels use neg/pos; model expressions use Zn/Ce. The aliases must be explicit.

| ID / parameter | Equation symbol | Value/unit as printed | Provenance | Applies to |
| --- | --- | --- | --- | --- |
| K01 Cerium exchange current | i_Ce,0 | 242 A m−2 | Literature adopted [31], 50 °C | E17/E20/E21/E25/E26 |
| K02 Zinc exchange current | i_Zn,0 | 74 A m−2 | Literature adopted [31], 50 °C | B6 |
| K03 HER exchange current | i_H2,0 | **2.21e−5 A m−2** | **Fitted**, footnote c; second cycle | B7 |
| K04 OER exchange current | i_O2,0 | 5.08e−6 A m−2 | Literature [44,45], interpolated footnote a | E27 |
| K05 Zn cathodic transfer | alpha_c,Zn = alpha_c,neg | 0.5, dimensionless | Literature [46] | B6 |
| K06 Zn anodic transfer | alpha_a,Zn = alpha_a,neg | 0.5 | Literature [44] | B6 |
| K07 Ce cathodic transfer | alpha_c,Ce = alpha_c,pos | 0.33 | Literature [47] | E17/E21/E26 |
| K08 Ce anodic transfer | alpha_a,Ce = alpha_a,pos | 0.27 | Literature [47] | E17/E20/E25 |
| K09 HER transfer | beta_H2 | 0.5 | Literature [48] | B7 |
| K10 OER transfer | beta_O2 | 0.52 | Literature [49] | E27 |
| K11 Zn standard potential | E0_Zn = E0_neg | −0.757 V | Literature [50], 50 °C | B6 |
| K12 Ce standard potential | E0_Ce = E0_pos | 1.639 V | Literature [34], 50 °C | E19 |
| K13 Oxygen standard/formal potential | E0_O2 | 1.21 V | Literature [50], 50 °C | E28 |
| K14 Hydrogen standard potential | E0_H2 | 0.00 V | Literature [50], 50 °C | B7 |
| K15 Zn(II) reference concentration | c_Zn(II),ref | 1.5 mol dm−3 =1500 mol m−3 | Published reference value, no separate citation marker | B6 |
| K16 Zn reference concentration | c_Zn,ref | 1.0 mol dm−3 =1000 mol m−3 | Published reference value; surface-inventory normalization **unresolved U-03** | B6 |
| K17 Ce(IV) transfer coefficient | k_m,Ce(IV) | **2.8e−5 m s−1** | **Fitted**, footnote c; depends on mesh and flow | E20–E26 |
| K18 Zn electron number | n_Zn | 2 | Stoichiometry, Fig. 1d p. 4/Table 2 p. 6 | B6 |
| K19 Ce electron number | n_Ce | 1 | Explicit §3.2 p. 5 | E19/E10 |

Fig. 1d p. 4 writes HER as 2H+ +2e− → H2 and OER as H2O → 1/2 O2 +2H+ +2e−. Those written reaction extents each transfer two electrons. An equivalent full-O2 stoichiometric vector would transfer four electrons; changing the extent requires changing the entire coefficient vector consistently, not inserting n=4 into an otherwise two-electron source array. Transfer coefficients beta in the printed side-current exponents already use the paper's convention and must not acquire an extra n factor.

These E0 values must not be compared directly with plotted Ag/AgCl electrode potentials without a defined reference transformation (U-07).

## Fit provenance and published variations

P §§5–6.1 pp. 7–8: \(a,\ i_{H_2,0},\ k_{m,Ce(IV)}\) were manually estimated one at a time using distinct response sensitivities, fitted to the second charge/discharge cycle (Fig. 2), then used subsequently. No objective function, confidence intervals, covariance, automated optimizer, or uniqueness proof is reported. Keep their dependence on electrode, cycle state and baseline visible.

| Scenario | Published value or result | Location and status |
| --- | --- | --- |
| Alternative first-cycle HER fit | 6.52e−5 A m−2 | P p. 8; explanatory first-cycle fit, not replacement for K03; U-11 |
| Current-density sweeps | 15, 25, 35 mA cm−2; 45 mA cm−2 conversion example; 60 mA cm−2 mass-transfer case | P §§6.2–6.3 pp. 10–13; model predictions |
| Ce(IV) mass-transfer sweep | 2.8e−6, 2.8e−5, 2.8e−4 m s−1 | P Fig. 6 p. 11/Fig. 7 p. 13; sensitivity inputs |
| Mixed negative electrolyte | 0.9 M zinc methanesulfonate +0.6 M ZnCl2 in 1 M MSA | P §6.4 p. 12; distinct chemistry |
| Mixed Zn exchange current | 53.4e−3 A cm−2 =534 A m−2 | P p. 12; compared with 7.4e−3 A cm−2 =74 A m−2 |
| Mixed chloride entry | P states initial Cl− 0.6 M | P p. 12; U-14 conflicts with simple 0.6 M ZnCl2 dissociation; no baseline adoption |

## Derived quantities and physical constants

These are **derived proposals for later checks**, not fitted or independently published inputs.

| Quantity | Derivation/value | Use |
| --- | --- | --- |
| Apparent area | H L_w =9e−4 m2 | Total current and surface integrals |
| Current magnitude | i_app H L_w =0.225 A | Baseline charge is 810 C over 3600 s if current stays constant |
| Inlet superficial speed | Q/(L_w L_f)=0.0090277778 m s−1 | B1, SI conversion check; not automatically pore velocity |
| Ce(III) mass transfer | (1.520/1.075)×2.8e−5 ≈3.95907e−5 m s−1 | E22; not separately fitted |
| Effective diffusivities | epsilon^1.5 D_j | E12; do not apply a second porosity factor |
| Effective solid conductivity | epsilon^1.5 sigma_s | E15 as printed |
| Membrane proton concentration | −z_f c_f=1200 mol m−3 | B5, fixed |
| Conditional total resistance | ASR/(H L_w)=0.5 Ω | Only if apparent area and loss allocation are confirmed, U-06; conditional 0.1125 V drop at 0.225 A |
| Faraday constant | F [C mol−1] | Universal; numeric convention not tabulated in P |
| Gas constant | R [J mol−1 K−1] | Universal; numeric convention not tabulated in P |

Use a versioned physical-constants source in the first implementation milestone. No additional experimental material property is inferred from those constants.

## Dynamic unknowns

Concentrations in both cell domains and tanks, ionic/solid/membrane potentials, negative fluid velocity/pressure, positive Darcy velocity/pressure, surface Zn inventory, surface Ce concentrations and reaction currents change during a run. \(A_a,A_c,E^{eq},\eta,D^{eff},\sigma^{eff}\) are derived algebraic quantities. “Fixed coefficient” within one run does not mean universal property.

## Unresolved parameter and closure register

| Missing or ambiguous item | Source location | Required resolution before use |
| --- | --- | --- |
| Negative/positive electrolyte density and viscosity | E03 p. 3/E16 p. 5, absent Tables 3–4 | Obtain temperature/composition-specific properties with units; water values would be an explicit unverified approximation (U-08) |
| Zn surface-state normalization and evolution | Table 2 p. 6, Table 4 p. 7, Fig. 4b p. 9 | Establish how mol m−2 inventory becomes \(c_{Zn}/c_{Zn,ref}\); no assumed film thickness (U-03) |
| Initial Zn numerical inventory/seed | §2 p. 3 and Table 2 p. 6 | Physical discharged state does not specify any computational seed (U-03) |
| HER denominator c_H+,b | Table 2 p. 6 | Bulk/reference location and time dependence (U-03) |
| Negative electrode material conductivity | Not separately tabulated | Only needed if adding explicitly resolved negative solid; do not copy Ti value or invent geometry (U-06/U-08) |
| Inter-fiber distance d | Text before Eq. 22 p. 5 | Not required if using fitted K17/E22; required to use D/d as independent prediction |
| Flow-dependent k_m(Q) | §6.3 pp. 11–12/O §31 | No supplied correlation; changing flow alone does not recalibrate surface transfer (U-16) |
| Temperature functions for D,i0,k_m,sigma,E0,rho,mu | Table 4 p. 7/O §32 | Values at 50 °C cannot define activation energies or arbitrary-temperature behavior (U-16) |
| Reference-electrode offset and sampling coordinates | §2 p. 3/§6.1 p. 9 | Obtain Ag/AgCl details and potential extraction convention (U-07) |
| ASR area, loss partition and collector inclusion | Eq. 30 p. 6/Table 4 p. 7/p. 9 | Resolve before assembling final voltage (U-06) |
| Ce seed charge correction | Table 3 p. 7 | Declare which quantity changes and record mass/charge effect (U-04) |
| First-cycle HER schedule | §6.1 p. 8 | Obtain exact computational treatment; no invented cycle switch (U-11) |
| Signed reaction-source/flux coefficient arrays | Eq. 10 p. 5/Table 2 p. 6 | Derive and review orientation and stoichiometry (U-09) |
| Precipitation, gas-phase and degradation coefficients | O §§41–42 | Additional physics and new evidence required; no guessed rate law (U-16) |
| Element order, mesh distribution, time integration and scaling | P §5 p. 7 | Obtain original model or declare independent numerical choices (U-15) |

## Numerical settings reported by the paper

| Item | Published setting | Interpretation |
| --- | --- | --- |
| Solver platform | COMSOL Multiphysics | P §5 p. 7 |
| Method | Finite element | Discretization family only |
| Mesh | 4,150 elements | Chosen after refinement checks; not a portable resolution target |
| Relative / absolute tolerances | 1e−3 /1e−4 | Scaling, variables and solver role not fully specified |
| Runtime | Approximately 2.5 h, five cycles | i5-7200U, 64-bit, 8 GB; no prediction for new implementation |

Unit conversions and conditional calculations here are specification checks, not simulation results. Every unresolved item must remain visibly unresolved in a future input schema.
