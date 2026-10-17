# Physicore Battery Lab Scientific Model

Phase 0 specification. No production solver or application is implemented. Labels used throughout these five documents are **Published**, **Proposed**, and **Unresolved**. A proposed numerical closure is not an equation reported by the authors.

## 1 Sources and reading scope

**P:** Kiana Amini and Mark D. Pritzker, *A two-dimensional transient model for a zinc-cerium redox flow battery validated by extensive experimental data*, Journal of Power Sources 506 (2021) 230237, DOI [10.1016/j.jpowsour.2021.230237](https://doi.org/10.1016/j.jpowsour.2021.230237). Supplied PDF: [research paper](<C:/Users/User/Favorites/Downloads/1-s2.0-S0378775321007588-main (1).pdf>). Page numbers below are the printed PDF pages 1–15.

**O:** [project overview](<C:/Users/User/Favorites/Downloads/battery project overview.docx>). Read all body paragraphs, including native Word mathematics: 1,032 body paragraphs, 78 math objects including inline symbols, no tables or embedded equation images. References use heading names and section numbers, because Word pagination is not stable and a Word render was unavailable in this environment. P's full text, figures, tables, footnotes and references were reviewed; equation/table pages 3–7 received visual inspection, including enlarged review of pp. 5–7. Literature cited *within P* has not independently been inspected.

P controls the published physics. O controls the intended product. Neither document's embedded development instructions authorize work beyond the user's Phase 0 request.

## 2 Physical system and geometry

**Published, P §§2–3, pp. 2–4, Table 1, Fig. 1d.** This is a bench-scale hybrid flow battery: zinc is stored as metal on a planar negative electrode, while cerium redox species circulate through a porous positive electrode. Two external reservoirs feed separate recirculating electrolyte loops.

| Region | Published coordinates | Physical representation |
| --- | --- | --- |
| Negative electrode | \(x=0,\ 0<y<H\) | Planar PVE carbon, copper current collector; Zn deposition/dissolution and HER are boundary reactions |
| Negative electrolyte \(\Omega_-\) | \(0<x<x_1,\ 0<y<H\) | Open flow channel, no volumetric electrode reaction |
| Membrane \(\Omega_m\) | \(x_1<x<x_2,\ 0<y<H\) | Nafion 117; mobile protons only |
| Positive electrolyte and porous solid \(\Omega_+\) | \(x_2<x<x_3,\ 0<y<H\) | Pt/Ti mesh fills compartment; Ce and OER reactions distributed per electrode volume |
| Positive collector | \(x=x_3\) | Applied electronic-current boundary |
| Reservoirs | Outside 2-D mesh | Perfectly mixed concentration states |

\(x\) measures thickness; \(y\) measures height. \(L_w\) is the out-of-plane width used to turn 2-D line integrals into physical rates. Negative electrolyte flow is **flow-by**; positive flow is **flow-through**. The four 1.5 mm Pt/Ti mesh layers, 6 mm Ti collector and 6 mm PVE electrode describe the physical assembly, not additional fluid domains to invent.

**Proposed coordinate construction:** \(x_1=L_f,\ x_2=L_f+L_m,\ x_3=2L_f+L_m\), assuming both compartments use the reported 6 mm depth. Tag this geometric construction separately from the printed Table 2 coordinates, which conflict with the narrative (U-01).

## 3 Species and units

| Domain | Species | Charge \(z\) |
| --- | --- | --- |
| Negative \(k\) | Zn(II), H+, CH3SO3− | +2, +1, −1 |
| Positive \(j\) | Ce(III), Ce(IV), H+, CH3SO3− | +3, +4, +1, −1 |
| Membrane | H+ and immobile sulfonate sites | +1, −1 |

Water is the solvent; H2/O2 are side-reaction products without a resolved gas phase. Metallic Zn is an electrode inventory, not another dissolved negative-electrolyte species. Chloride belongs only to the separate mixed-electrolyte scenario in P §6.4.

The common variable dictionary applies to **every equation entry below**:

| Symbol | Meaning and dimensional units |
| --- | --- |
| \(c_k,c_j,c_{j,s},c^{in}\) | Bulk, surface or tank/inlet concentration, mol m−3 in an SI implementation; tables print mol dm−3 |
| \(\vec N\) | Molar flux, mol m−2 s−1 by Eq. 2; P's p. 2 symbol list instead prints mol m−3 s−1, recorded as U-10 |
| \(S\) | Source per total domain volume, mol m−3 s−1 |
| \(\vec v,P,\rho,\mu\) | Velocity m s−1; pressure Pa; density kg m−3; dynamic viscosity Pa s |
| \(\phi_e,\phi_s,\phi_m,E,E^0,\eta\) | Ionic, electronic, membrane, electrode, standard/formal potential and overpotential, V |
| \(i,\vec i,i_0\) | Current density and exchange current density, A m−2; \(I\) is total current, A |
| \(D,D^{eff},k_m,k_{kc},a\) | m2 s−1; m2 s−1; m s−1; m2; m−1 |
| \(\sigma_s,\sigma_s^{eff},\sigma_m,R_{ohm}\) | Conductivities S m−1; total resistance Ω |
| \(F,R,T,t\) | Faraday constant C mol−1; gas constant J mol−1 K−1; K; s |
| \(\epsilon,\alpha,\beta,z,\nu,n,A_a,A_c\) | Dimensionless porosity, transfer coefficients, charge, stoichiometry, electron count, auxiliary factors |
| \(H,L_w,L_f,L_m,V_e,d\) | Lengths m; reservoir volume m3; inter-fiber distance m |

Subscripts \(a,c\) in kinetics mean anodic/cathodic, not positive/negative battery sides. Subscript \(s\) on a concentration means electrode surface, whereas \(\phi_s\) means solid potential. The same \(Q\) must not name both volumetric flow and electrical charge in software.

**Published sign information:** anodic terms in BV expressions are positive; cathodic terms are negative. Ce oxidation occurs during charge, Zn deposition is cathodic, HER is negative and OER positive. Table 2 prescribes \(+i_{app}\) at the positive collector on charge and \(-i_{app}\) on discharge. Vector components and boundary-normal fluxes require an explicit orientation; a current magnitude is not a signed normal flux. Eq. 29's printed plus sign must be retained until reconciled (U-02).

## 4 Equation catalogue

Expressions below reproduce P's mathematical content and signs. Formatting is converted to Markdown mathematics. No physical correction is silently applied. Each entry specifies domain, inputs, conditions, coupling and a future test. All units refer to §3. Algebraic laws have no independent initial condition; their states must satisfy the coupled constraints at initialization. Boundary sets B1–B8 are specified in §5. Test IDs are defined in VALIDATION_PLAN.md.

### E01 Species conservation — P Eq. 1, p. 3

$$\frac{\partial c_k}{\partial t}+\nabla\cdot\vec N_k=0.$$

Domain: \(\Omega_-\). Inputs: negative species set and fluxes. IC: Table 3/B4; BC: B1–B3, B5–B6. Couples E02 and electrode fluxes B6 to reservoir B3. No homogeneous source is present. Test T-TRANSPORT: zero flux leaves a uniform state unchanged; integrated change equals boundary flux.

### E02 Nernst–Planck flux — P Eq. 2, p. 3

$$\vec N_k=-D_k\nabla c_k-\frac{z_kc_kD_kF}{RT}\nabla\phi_{e,neg}+\vec v_{neg}c_k.$$

Domain: \(\Omega_-\). Inputs: \(D_k,z_k,F,R,T\). States: \(c_k,\phi_{e,neg},\vec v_{neg}\). IC/BC inherited from E01, E03 and B1–B6. Couples concentration gradients, electric fields and fluid motion to E01/E06–E08. Test T-FLUX: isolate each term; neutral species has no migration; constant fields yield only convection.

### E03 Momentum balance — P Eq. 3, p. 3

$$\rho\left(\frac{\partial\vec v_{neg}}{\partial t}+\vec v_{neg}\cdot\nabla\vec v_{neg}\right)=-\nabla\vec P_{neg}+\mu\nabla^2\vec v_{neg}.$$

P prints a vector arrow on pressure; ordinary fluid pressure is scalar. Preserve this notation issue in U-10. Domain: \(\Omega_-\). Inputs: density, viscosity, geometry. IC: fluid velocity not supplied (U-08); BC: prescribed inlet velocity, outlet pressure B1/B2, wall conditions not fully specified. Couples E04 and E02. Test T-FLOW: analytic channel-flow benchmark and volumetric-flow continuity, after wall conditions are declared.

### E04 Fluid continuity — P Eq. 4, p. 3; positive application p. 5

$$\nabla\cdot\vec v_{neg}=0.$$

Also \(\nabla\cdot\vec v_{pos}=0\) in P's text. Domains: both electrolytes. Inputs: incompressible assumption. IC/BC: consistent velocity field, B1/B2 plus unresolved walls. Couples E03/E16. Test T-FLOW: equal inlet/outlet volume flow and small divergence.

### E05 Electroneutrality — P Eq. 5, p. 3

$$\sum_k z_kc_k=0.$$

Printed for negative species; the charge-neutrality assumption also constrains the positive species set. Inputs: charges. Domain: each electrolyte bulk. IC: charge-balanced Table 3 state subject to U-04; BC: inlet composition and membrane proton transfer. Couples species equations to ionic potential/current. Test T-NEUTRALITY: calculate charge residual for every initial/input state and accepted step; do not merely omit an equation and assume neutrality.

### E06 Species ionic current — P Eq. 6, p. 3

$$\vec i_{e_k}=z_kF\vec N_k.$$

Domain: \(\Omega_-\), analogous sum for positive electrolyte must be explicitly derived. Inputs: \(z_k,F\). IC/BC: inherited from flux and charge boundaries. Couples E02 to E07/E08 and membrane current continuity. Test T-CURRENT: units and sign for cation/anion flux.

### E07 Expanded species current — P Eq. 7, p. 3

$$\vec i_{e_k}=z_kF(-D_k\nabla c_k)+z_kF\left(-\frac{z_kc_kD_kF}{RT}\nabla\phi_{e,neg}\right)+z_kF(\vec v_{neg}c_k).$$

Domain, inputs and IC/BC: E02/E06. This is an identity, not a second independent field equation. Couples E06 to E08. Test T-CURRENT: evaluate E06 and E07 from identical analytic fields and compare.

### E08 Total ionic current — P Eq. 8, p. 3

$$\vec i_e=\sum\vec i_{e_k}=F\sum_kz_k(-D_k\nabla c_k)-\frac{F^2}{RT}\sum_kz_k^2D_kC_k\nabla\phi_{e,neg}.$$

P prints capital \(C_k\) in the final term; no separate capital-C variable is defined (U-10). Domain: \(\Omega_-\). Inputs: E02 parameters. Conditions: electroneutrality removes summed convective current; electrode/membrane current constraints B5–B8. Couples ionic potential to transport and reaction currents. Test T-CURRENT: direct species-current sum equals E08 under neutrality; non-neutral test must not incorrectly cancel convection.

### E09 Porous species conservation — P Eq. 9, p. 4

$$\frac{\partial\epsilon c_j}{\partial t}+\nabla\cdot\vec N_j=S_j.$$

Domain: \(\Omega_+\). Inputs: porosity, sources, flux. IC: Table 3/B4. BC: B1–B3/B5; external collector and wall species conditions need resolution (U-08). Couples E10/E11 to reservoirs and kinetics. Test T-POROUS: stored amount uses \(\epsilon c_j\), not \(c_j\); closed-domain source integrates correctly.

### E10 Volumetric reaction source — P Eq. 10, p. 5

$$S_j=\sum_{m'}\frac{a\nu_{j,m'}i_{m'}}{n_{m'}F}.$$

Domain: \(\Omega_+\). Inputs: fitted \(a\), stoichiometric coefficients, electron counts. Reaction currents: E17/E27. IC/BC inherited from E09 and reaction potentials; no independent source IC. P says stoichiometry is written in reduction direction but does not tabulate its signed coefficient array (U-09). Test T-STOICH: Ce total conserved and charging consumes Ce(III), produces Ce(IV); OER produces H+. Confirm source signs against positive anodic current before assembly.

### E11 Porous Nernst–Planck flux — P Eq. 11, p. 5

$$\vec N_j=-D_j^{eff}\nabla c_j-\frac{z_jc_jD_j^{eff}F}{RT}\nabla\phi_{e,pos}+\vec v_{pos}c_j.$$

Domain: \(\Omega_+\). Inputs: E12, charges, \(F,R,T\). IC/BC: E09/E16/B1–B5. Couples transport, potential and Darcy velocity. No extra porosity multiplier is printed on convection; the velocity interpretation must match this flux (U-08). Test T-FLUX and T-POROUS: term isolation and consistent superficial-flow inventory.

### E12 Effective diffusion — P Eq. 12, p. 5

$$D_j^{eff}=\epsilon^{1.5}D_j.$$

Domain: porous positive electrolyte only. Inputs: porosity and molecular diffusivity. No independent IC/BC; inherited by E11. Test T-POROUS: \(\epsilon=1\) recovers molecular diffusion; dimensionless correction and porosity sensitivity.

### E13 Positive charge conservation — P Eq. 13, p. 5

$$\nabla\cdot\vec i_{pos}=\nabla\cdot\vec i_{s,pos}+\nabla\cdot\vec i_{e,pos}=0.$$

Domain: \(\Omega_+\). Inputs: solid/ionic currents. IC: consistent algebraic potentials; BC: B5/B8, remaining insulation conditions U-08. Couples E14, ionic-current derivation and reaction transfer E10. Separate phase current-divergence/source relations require an explicitly derived closure (U-09); E13 alone does not determine both potentials. Test T-CHARGE: equal/opposite phase transfer; total terminal current matches applied current.

### E14 Solid Ohm law — P Eq. 14, p. 5

$$\vec i_{s,pos}=-\sigma_s^{eff}\nabla\phi_{s,pos}.$$

Domain: positive solid. Inputs: E15 conductivity. IC: algebraic; BC: B8 positive current and no solid current through membrane, the latter a proposed missing-boundary closure. Couples E13/E18/E28. Test T-OHM: linear potential gives analytic current with the printed minus sign.

### E15 Effective solid conductivity — P Eq. 15, p. 5

$$\sigma_s^{eff}=\epsilon^{1.5}\sigma_s.$$

Domain: porous positive solid. Inputs: Table 1 porosity and Table 4 solid conductivity. No independent IC/BC; E14 inherits it. P uses electrolyte porosity here; retain it rather than substituting \((1-\epsilon)^{1.5}\). Test T-POROUS: evaluate exactly the printed factor.

### E16 Darcy flow — P Eq. 16, p. 5

$$\vec v_{pos}=-\frac{k_{kc}}{\mu_{dyn}}\nabla P_{pos}.$$

P's denominator is \(\mu_{dyn}\); surrounding prose calls it dynamic viscosity \(\mu\). Domain: \(\Omega_+\). Inputs: permeability, viscosity, geometry. IC: no independent transient term in this Darcy law; BC: B1/B2 and unresolved walls. Couples E04/E11. Test T-DARCY: uniform pressure gradient produces proportional velocity and positive dissipation.

### E17 Cerium Butler–Volmer kinetics — P Eq. 17, p. 5

$$i_{Ce}=i_{Ce,0}\left[\frac{c_{Ce(III),s}}{c_{Ce(III)}}\exp\left(\frac{\alpha_{a,Ce}F}{RT}\eta_{Ce}\right)-\frac{c_{Ce(IV),s}}{c_{Ce(IV)}}\exp\left(-\frac{\alpha_{c,Ce}F}{RT}\eta_{Ce}\right)\right].$$

Domain: internal positive electrode surfaces, represented volumetrically through \(a\). Inputs: \(i_{Ce,0},\alpha_{a,Ce},\alpha_{c,Ce},T,F,R\). IC/BC inherited from positive concentrations/potentials and B4/B5/B8. Couples E18–E26, E10/E13. Positive current oxidizes Ce(III). Test T-CE: zero overpotential with surface=bulk gives zero current; changing surface supply changes kinetics.

### E18 Cerium overpotential — P Eq. 18, p. 5

$$\eta_{Ce}=E_{Ce}-E_{Ce}^{eq}=\phi_{s,pos}-\phi_{e,pos}-E_{Ce}^{eq}.$$

Domain: \(\Omega_+\). Inputs: equilibrium potential E19. IC/BC: algebraic from potential and concentration constraints. Couples E17/E19 and E13/E14. Test T-KINETICS: common potential offset leaves overpotential unchanged; equal actual/equilibrium potentials gives zero.

### E19 Cerium Nernst potential — P Eq. 19, p. 5

$$E_{Ce}^{eq}=E_{Ce}^0+\frac{RT}{nF}\ln\left(\frac{c_{Ce(IV)}}{c_{Ce(III)}}\right),\qquad n=1.$$

Domain: positive electrolyte/electrode. Inputs: \(E_{Ce}^0,T,n,F,R\), strictly positive bulk concentrations. IC: Ce(IV) seed B4. BC inherited. Couples E18/E17; no activity corrections are included. Test T-NERNST: equal concentrations give \(E^0\); multiplying ratio by \(e\) changes potential by \(RT/F\); reject zero/negative logarithm inputs.

### E20 Ce(III) surface balance — P Eq. 20, p. 5

$$Fk_{m,Ce(III)}(c_{Ce(III)}-c_{Ce(III),s})=i_{Ce,0}\left[\frac{c_{Ce(III),s}}{c_{Ce(III)}}\exp\left(\frac{\alpha_{a,Ce}F}{RT}\eta_{Ce}\right)-\frac{c_{Ce(IV),s}}{c_{Ce(IV)}}\exp\left(-\frac{\alpha_{c,Ce}F}{RT}\eta_{Ce}\right)\right].$$

Domain: positive internal surface. Inputs: Ce(III) mass-transfer coefficient and E17 inputs. Algebraic IC/BC inherited; bulk and surface are distinct variables. Couples E17/E21–E26. Test T-CE: residual zero when E23/E24 are substituted at positive test concentrations.

### E21 Ce(IV) surface balance — P Eq. 21, p. 5

$$Fk_{m,Ce(IV)}(c_{Ce(IV)}-c_{Ce(IV),s})=i_{Ce,0}\left[\frac{c_{Ce(IV),s}}{c_{Ce(IV)}}\exp\left(-\frac{\alpha_{c,Ce}F}{RT}\eta_{Ce}\right)-\frac{c_{Ce(III),s}}{c_{Ce(III)}}\exp\left(\frac{\alpha_{a,Ce}F}{RT}\eta_{Ce}\right)\right].$$

Domain/conditions: E20. Inputs: fitted \(k_{m,Ce(IV)}\) and E17 parameters. RHS is \(-i_{Ce}\), not \(+i_{Ce}\). Couples E20/E22–E26. Test T-CE: equal/opposite molar transfer; both surface balances hold.

### E22 Relative Ce mass transfer — P Eq. 22, p. 5

$$k_{m,Ce(III)}=\frac{D_{Ce(III)}}{D_{Ce(IV)}}\times k_{m,Ce(IV)}.$$

Domain: positive mesh. Inputs: molecular diffusivities and fitted Ce(IV) coefficient. No independent IC/BC. Couples E20/E21/E23–E26. P also prints the unnumbered approximation \(k_{m,i}\approx D_i/d\) above Eq. 22; \(d\) is inter-fiber distance, not supplied numerically. Test T-MASS-TRANSFER: coefficient ratio equals diffusivity ratio; do not independently fit Ce(III).

### E23 Ce(III) surface concentration — P Eq. 23, p. 5

$$c_{Ce(III),s}=\frac{A_cc_{Ce(IV)}\left(\frac{k_{m,Ce(IV)}}{k_{m,Ce(III)}}\right)+(1+A_c)c_{Ce(III)}}{1+A_c+A_a}.$$

Domain: positive mesh. Inputs: E22/E25/E26 and bulk concentrations. Algebraic conditions inherited from E20/E21. Couples E17/E20. Test T-CE: independently solve the two linear surface-balance equations and compare this expression.

### E24 Ce(IV) surface concentration — P Eq. 24, p. 5

$$c_{Ce(IV),s}=\frac{A_ac_{Ce(III)}\left(\frac{k_{m,Ce(III)}}{k_{m,Ce(IV)}}\right)+(1+A_a)c_{Ce(IV)}}{1+A_c+A_a}.$$

Domain, inputs and conditions: E23. Couples E17/E21. Test T-CE: compare independent surface solution; mass-transfer coefficients tending large approach surface=bulk. Do not require surface concentration always below its own bulk value: a generated species can have surface enrichment.

### E25 Anodic auxiliary factor — P Eq. 25, p. 5

$$A_a=\frac{i_{Ce,0}}{Fk_{m,Ce(III)}c_{Ce(III)}}\exp\left(\frac{\alpha_{a,Ce}F\eta_{Ce}}{RT}\right).$$

Domain: positive mesh. Inputs: numerator parameters, bulk Ce(III), E18. IC/BC inherited, denominator requires positive concentration. Couples E23/E24. Test T-CE: dimensionless, positive for positive inputs, agrees with direct E20 coefficient.

### E26 Cathodic auxiliary factor — P Eq. 26, p. 5

$$A_c=\frac{i_{Ce,0}}{Fk_{m,Ce(IV)}c_{Ce(IV)}}\exp\left(-\frac{\alpha_{c,Ce}F\eta_{Ce}}{RT}\right).$$

Domain: positive mesh. Inputs: Ce(IV) concentration and transfer coefficient, E17/E18 parameters. IC: numerical Ce(IV) seed; BC inherited. Couples E23/E24. Test T-CE: dimensionless and compare direct E21 coefficient; test depletion and overflow handling explicitly.

### E27 Oxygen evolution — P Eq. 27, p. 5

$$i_{O_2}=i_{O_2,0}\exp\left(\frac{\beta_{O_2}F}{RT}\eta_{O_2}\right).$$

Domain: positive internal surfaces during charge. Inputs: \(i_{O_2,0},\beta_{O_2},T,F,R\). IC/BC inherited from E28 and positive potential. Couples E10/E13. Published expression is one-directional; setting it to zero during discharge requires an explicit cycle-mode policy (U-09), not reversing it into oxygen reduction. Test T-SIDE: positive current, monotonic overpotential response and appropriate phase gating.

### E28 Oxygen overpotential — P Eq. 28, p. 5

$$\eta_{O_2}=\phi_{s,pos}-\phi_{e,pos}-E_{O_2}^0.$$

Domain: positive surfaces. Inputs: temperature-specific oxygen formal potential. Algebraic IC/BC inherited. Couples E27 and solid/ionic potential. Test T-KINETICS: gauge invariance and declared reference convention.

### E29 Membrane Ohm law — P Eq. 29, p. 6

$$\vec i_m=\sigma_m\nabla\phi_m.$$

Domain: \(\Omega_m\). Inputs: membrane conductivity. IC: algebraic potential consistent with B5. BC: Donnan jumps/current continuity and unresolved end insulation. Couples electrolytes through proton transfer; concentration is fixed, diffusion/convection omitted. Test T-MEMBRANE: orientation-aware 1-D slab current and current continuity. **Unresolved U-02:** plus sign differs from E14 and conventional positive-charge migration in E02. Do not silently negate it.

### E30 Cell voltage — P Eq. 30, p. 6

$$V_{cell}=E_{pos}-E_{neg}\pm|IR_{ohm}|=(\phi_{s,pos}-\phi_{e,pos})-(\phi_{s,neg}-\phi_{e,neg})\pm|IR_{ohm}|.$$

Domain: cell-level observable, not a PDE. Inputs: total current, effective measured cell resistance, solved electrode/electrolyte potentials. IC/BC inherited from coupled cell. Positive charge correction and negative discharge correction are the proposed physical mapping of the printed \(\pm\); potential sampling and ohmic double counting remain U-06/U-07. Couples all transport/kinetic blocks and stopping event B8. Test T-VOLTAGE: limiting cases, charge/discharge sign, current-density versus total-current conversion and resistance accounting.

## 5 Initial and boundary equation catalogue

These are **unnumbered equations in P Table 2, p. 6**, unless another location is given. B IDs are local specification identifiers, never paper equation numbers. Normals in the printed reservoir formula are ambiguous (U-05).

### B1 Inlet concentrations and velocity

As printed, including inconsistent negative-domain coordinates:

$$c_k(x_1<x<x_2,0,t)=c_k^{in}(t),\quad c_j(x_2<x<x_3,0,t)=c_j^{in}(t),$$
$$v(x_1<x<x_2,0,t)=v_{in},\quad v(x_2<x<x_3,0,t)=v_{in},\quad v_{in}=\frac{Q}{L_wL_f}.$$

Domains: inlet boundaries at \(y=0\). Inputs: flow, channel cross-section, dynamic tank states B3. Coupling: E01/E03/E09/E16 and reservoirs. Initial values: Table 3. Interpretation: inlet concentration is uniform across an inlet but changes in time; p. 6 prose about held-constant concentration cannot override the printed reservoir equations. Tests T-BASELINE/T-RESERVOIR: consistent SI velocity and changing inlet composition.

### B2 Outlet diffusion and pressure

$$-D_k\nabla c_k\cdot\vec n=0,\quad-D_j\nabla c_j\cdot\vec n=0,$$
$$P(x_1<x<x_2,H,t)=P_{out,neg},\quad P(x_2<x<x_3,H,t)=P_{out,pos}.$$

The first outlet law uses molecular \(D_j\) as printed, although E11 uses \(D_j^{eff}\). It specifies zero **diffusive** flux, not zero total outlet flux. Domain: \(y=H\). Inputs: outlet pressures from Table 3. IC inherited from flow/species solution. Couples E02/E11 to B3. Test T-OUTLET: convection leaves domain while diffusive normal flux is zero; verify treatment of migration and inlet/outlet electric conditions (U-08).

### B3 Perfectly mixed reservoir balances

$$\frac{\partial c_k^{in}}{\partial t}=\frac{L_w}{V_e}\left(\int_{neg,outlet}(\vec N_k\cdot\vec n)\,dS-\int_{neg,inlet}(\vec N_k\cdot\vec n)\,dS\right),$$
$$\frac{\partial c_j^{in}}{\partial t}=\frac{L_w}{V_e}\left(\int_{pos,outlet}(\vec N_j\cdot\vec n)\,dS-\int_{pos,inlet}(\vec N_j\cdot\vec n)\,dS\right).$$

Domain: two well-mixed external tanks. Inputs: each \(V_e,L_w\), inlet/outlet full species flux; IC: Table 3. Couples E01/E09 to B1 on the same time step. U-05: if \(\vec n\) is a domain-outward normal on both boundaries, subtracting an inlet outward flux gives the wrong tank balance; document local stream normals before discretization. Proposed check, not replacement transcription: with uniform streams, the tank receives \(Q(c_{out}-c_{tank})\) mol/s after unit conversion. Test T-RESERVOIR: stationary uniform loop; tank+cell inventory closes exactly within numerical error.

### B4 Initial species states

$$c_k(x_1<x<x_2,y,t=0)=c_k^0,\quad c_j(x_2<x<x_3,y,t=0)=c_j^0.$$

Table 3 values are in PARAMETER_REGISTER.md. P §5 p. 6 says physical initial Ce(IV) is zero but numerical value is 0.001 mol dm−3 to prevent first-step division by zero. Inputs: initial compositions; domains: both electrolytes and proposed same tank compositions. Coupling: E05/E19/E26/B3. Test T-BASELINE: seed distinction, neutrality and correct domain mapping. **Unresolved:** numeric metallic-Zn initial condition, velocity initialization and initial algebraic potentials are not fully specified.

### B5 Membrane interfaces

As printed in Table 2:

$$\phi_m=\phi_e+\frac{RT}{F}\ln\left(\frac{c_{H^+,e}}{c_{H^+,m}}\right),\qquad c_{H^+,m}=-z_fc_f,$$
$$\vec i_e\cdot\vec n=\vec i_m\cdot\vec n\quad\text{at }(x=x_1,y),(x=x_2,y),$$
$$\vec N_k\cdot\vec n=0\quad (x=x_1,\text{except protons}),\quad
\vec N_j\cdot\vec n=0\quad (x=x_2,\text{except protons}).$$

Domain: both membrane/electrolyte interfaces. Inputs: \(c_f,z_f,T,R,F\), interface proton concentrations; units: V, mol m−3, A m−2 and mol m−2 s−1. No independent IC beyond consistent initial potentials. Couples E29, ionic currents and electrolyte species. Matching outward normals on two domains have opposite signs; printed equality presumes a common oriented normal. Test T-MEMBRANE: equal concentrations give zero jump, charge continuity and non-proton blocking. Explicit proton-flux/current conversion \(N_{H^+}=i_m/F\) is a derived relation requiring U-02 sign resolution.

### B6 Zinc kinetics and equilibrium

$$i_{Zn}=i_{Zn,0}\left[\frac{c_{Zn}}{c_{Zn,ref}}\exp\left(\frac{\alpha_{a,Zn}nF}{RT}\eta_{Zn}\right)-\frac{c_{Zn(II)}}{c_{Zn(II),ref}}\exp\left(-\frac{\alpha_{c,Zn}nF}{RT}\eta_{Zn}\right)\right],$$
$$\eta_{Zn}=E_{Zn}-E_{Zn}^{eq}=\phi_{s,neg}-\phi_{e,neg}-E_{Zn}^{eq},\quad
E_{Zn}^{eq}=E_{Zn}^0+\frac{RT}{nF}\ln\left(\frac{c_{Zn(II)}}{c_{Zn(II),ref}}\right).$$

Domain: \(x=0\) negative electrode. Inputs: Zn kinetic parameters, reference concentrations, \(n=2,T,F,R\), dynamic metallic Zn state. Units: current A m−2, potentials V; \(c_{Zn}\) normalization is U-03. IC: fully discharged carbon described, but precise numerical inventory initialization not supplied. BC: electrode reaction supplies Zn(II) flux, couples E01/E08 and B7/B8; the Faradaic flux map must be derived with explicit normals (U-09). Positive current dissolves Zn, negative current deposits it. Test T-ZN: no dissolution from zero metal; deposition increases inventory and consumes dissolved zinc; do not assume \(\eta_{Zn}=0\) implies zero current for arbitrary concentration ratios.

P Fig. 1d p. 4 prints the charge/discharge reactions \(Zn(II)+2e^-\rightleftharpoons Zn\) and \(Ce(III)\rightleftharpoons Ce(IV)+e^-\), with Zn reduction and Ce oxidation during charge. A zinc-inventory evolution equation is not separately printed. A candidate \(d\Gamma_{Zn}/dt=-i_{Zn}/(2F)\) for surface inventory \(\Gamma_{Zn}\) [mol m−2] is a **derived proposal**, not a source equation; converting it into \(c_{Zn}\) needs U-03 resolved. Test T-INVENTORY addresses that proposal.

### B7 Hydrogen evolution

$$i_{H_2}=i_{H_2,0}\left[-\frac{c_{H^+,neg}}{c_{H^+,b}}\exp\left(-\frac{\beta_{H_2}F}{RT}\eta_{H_2}\right)\right],\qquad
\eta_{H_2}=\phi_s-\phi_e-E_{H_2}^0.$$

Domain: \(x=0\), charging cathodic direction only. Inputs: fitted HER exchange current, transfer coefficient, formal potential, reference/bulk proton concentration (U-03), temperature and constants. IC/BC inherited from concentrations/potentials. Couples H+ electrode flux and total negative current; does not evolve gas volume. Test T-SIDE: current negative, correct H+ consumption, no anodic hydrogen oxidation invented. Fig. 1d p. 4 prints \(2H^++2e^-\to H_2\) and the positive charging reaction \(H_2O\to\tfrac12O_2+2H^++2e^-\).

### B8 Ground, current and operating events

$$\phi_s=0\ @(0,y),\quad i=i_{app}\ @(x_3,y)\ \text{during charge},\quad i=-i_{app}\ @(x_3,y)\ \text{during discharge}.$$

Domain: negative ground and positive collector. Inputs: current density, phase schedule. IC: consistent potentials; potential gauge cannot be chosen independently twice. P §2 p. 3 specifies charge for one hour, discharge until 0.5 V; duration/cutoff are experimental control rules, not new constitutive equations. Couples E30 and all kinetics/current balances. Test T-CYCLE: exact switch time, cutoff root localization, state continuity and charge accounting.

## 6 Efficiency and voltage-loss reporting

**Overview §28:** prints \(\eta_Q=(Q_{discharge}/Q_{charge})100\), \(\eta_V=(V_{discharge}/V_{charge})100\), \(\eta_E=\eta_Q\eta_V\). P reports efficiencies but supplies no numbered efficiency definition or averaging rule. These overview formulas cannot be silently labelled P equations.

**Proposed unambiguous reporting definitions:** let \(\mathcal Q_c=\int_c|I|dt,\ \mathcal Q_d=\int_d|I|dt\) [C], \(\mathcal W_c=\int_c V|I|dt,\ \mathcal W_d=\int_d V|I|dt\) [J]. Define charge fractions \(q=\mathcal Q_d/\mathcal Q_c\), mean voltages \(\bar V_c=\mathcal W_c/\mathcal Q_c,\ \bar V_d=\mathcal W_d/\mathcal Q_d\), voltage fraction \(v=\bar V_d/\bar V_c\), energy fraction \(e=\mathcal W_d/\mathcal W_c=qv\). Display \(100q,100v,100e\). Thus percentages multiply with division by 100. Zero-throughput cases are undefined, not zero efficiency. P's five-cycle averaging convention remains U-13. Test T-METRICS.

**Loss contributions:** E18/B6 activation, E20/E21 surface transfer, E02/E11 electrolyte transport, E14/E29 conduction, B5 jumps and E30 lumped ohmic term are coupled. O §27 gives illustrative fixed numbers (2.40 V ideal, 0.08/0.07/0.06 V losses, 2.19 V actual), not paper data. A unique additive loss decomposition is not specified in P. Proposed reporting must define reference states and avoid counting resolved conduction again in \(IR_{ohm}\) (U-06). Do not subtract extra mass-transfer and activation losses from potentials already containing them.

## 7 Assumptions and validation scope

P §3 p. 3 lists seven assumptions: (1) incompressible laminar electrolytes, Reynolds number <150; (2) dilute solution theory; (3) membrane permeable only to protons, other-ion/water crossover neglected over a few cycles; (4) gas bubbles do not alter electrolyte volume fraction or electrode ohmic resistance; (5) gravity neglected; (6) isothermal battery; (7) no homogeneous electrolyte reactions.

Further published modeling choices: perfectly mixed reservoirs; kinetic control of Zn under the concentrated negative-electrolyte condition (p. 6); no explicit precipitation; one-directional side-reaction laws; effective porous properties as printed; numerical Ce(IV) seed; finite surface Zn inventory. Dilute-solution treatment is a model approximation despite the high acid concentrations; do not claim ideality is experimentally exact.

P §6.1 pp. 8–10: first cycle preconditions the electrode; three primary parameters fit the second cycle. HER is higher on initially exposed carbon than on Zn, giving different first-cycle behavior. Baseline Zn depletion limits discharge throughout the tested cycles; cerium surface transfer also limits the first discharge. Residual Ce(IV) can remain even when discharge stops.

Full-cell and half-cell voltages are compared over five cycles; Fig. 4c shows Ce(IV) comparison only through cycle 4. P reports Ce(IV) differences around 0.01–0.02 mol dm−3 and below 5% for that comparison. On p. 10 precipitation is reported from the fourth cycle onward; at cycle 5 experimental Ce(IV) is about 0.27 mol dm−3 versus predicted 0.31. Five cycles are the paper's investigation horizon, not a guarantee that all five are precipitation-free or all errors are <5%. No application validation has occurred.

P §5 p. 7: COMSOL finite elements, 4,150 elements after comparing voltage/concentration under refinement, relative tolerance 1e−3, absolute tolerance 1e−4, about 2.5 h for five cycles on i5-7200U/8 GB hardware. Element order, stabilization, time integrator/order, internal time steps, COMSOL version, detailed mesh, variable scaling and nonlinear/linear solver settings are not provided.

## 8 Differences between overview and paper

| Overview requirement or simplification | Paper distinction and required treatment |
| --- | --- |
| Generic balance in §13 | Negative E01 has no bulk source; positive E09 has porosity storage and E10 sources |
| Generic BV in §21 | Actual Zn B6 has finite-metal/reference ratios and n=2; Ce E17 has bulk/surface ratios and n=1 |
| Generic \(N=k_m(c_b-c_s)\), §24 | Preserve distinct Ce(III)/Ce(IV) balances E20/E21 and linkage E22 |
| Simplified voltage in §27 | Preserve Eq. 30 and explicitly resolve sampling and resistance allocation |
| Percentage product in §28 | Needs normalization and averaging definitions; P gives no numbered efficiency formula |
| Editable concentrations, §6 | Inputs must satisfy charge balance; naive Table 3 seed is slightly inconsistent (U-04) |
| Flow sweep, §31 | P validates at fixed 65 mL/min; no general \(k_m(Q)\) correlation is supplied |
| Temperature/geometry sweeps, §§5/32 | Properties/fitted area/transfer must change consistently; 50 °C fit does not validate arbitrary designs |
| Long-term degradation, §§40–42 | P omits precipitation and stops at five cycles; accumulation tracking is not a lifetime model |
| Extended gas effects, §41 | HER/OER currents already exist; two-phase/bubble effects are new physics |
| Sequential arrows, §48 | They illustrate information dependencies, not authorization to solve each block once without coupled iteration |
| Error metrics, mesh and adaptive time control, §§35–39 | Added project features; equal tolerance numbers cannot prove COMSOL equivalence |
| Optimization and AI, §§33/43 | Application features; predictions must carry scope and provenance; AI cannot replace physics |
| UI-first phases, §51 | Proposed revised roadmap starts with verified scientific components and adds UI after credible outputs |

## 9 Unresolved scientific decisions

| ID | Exact source location | Unresolved issue and action |
| --- | --- | --- |
| U-01 | P p. 6 Table 2 versus p. 3 §3/Fig. 1d p. 4 | Table 2 locates negative inlet/initial/outlet at x1<x<x2, while geometry puts electrolyte at 0<x<x1. Retain transcription; explicitly approve narrative-based domain correction |
| U-02 | P p. 6 Eq. 29 and Table 2; p. 5 Eq. 14 | Membrane plus-gradient sign and interface normal convention. Derive consistent electrochemical sign map or obtain original model/author clarification |
| U-03 | P p. 6 zinc/HER laws; Table 4 p. 7; Fig. 4b p. 9 | Zn inventory shown as mol m−2 but reference printed mol dm−3; no mapping/evolution law, initial seed or detailed \(c_{H^+,b}\) definition. Obtain model normalization; no arbitrary thickness/seed |
| U-04 | P p. 7 Table 3 and p. 6 §5 | Ce(III)=0.8, Ce(IV)=0.001, H+=4, anion=6.4 give +0.004 mol charge dm−3. Preserve literal values; document any charge-balanced initialization as a deviation |
| U-05 | P p. 6 Table 2 reservoir balances | Inlet/outlet normals not defined sufficiently. Resolve using uniform-loop and whole-system inventory tests |
| U-06 | P pp. 6–7 Eq. 30/Table 4; p. 9 collector correction | Which losses are resolved, lumped ASR, or collector correction? Avoid duplicate ohmic losses; obtain original voltage extraction recipe |
| U-07 | P p. 3 reference electrodes; Eq. 30 p. 6; Fig. 3b p. 8 | Spatial sampling/averaging and Ag/AgCl-to-standard potential conversion not fully specified; do not assume electrode offset |
| U-08 | P §§3–5, Table 2 pp. 3–7 | Missing density/viscosity, wall/electric end conditions, velocity initialization, and detailed superficial/interstitial convention; declare closures before full solve |
| U-09 | P Eq. 10 p. 5/Table 2 p. 6 | Signed stoichiometric array, Faradaic flux maps, separate phase charge-source closures and charge-only gating need documented derivation |
| U-10 | P p. 2 symbol list/Eq. 3,8 p. 3/§4 p. 6/§6.3 p. 12 | Flux unit, vector pressure, C versus c, “1.500 mol m−3” wording, and \(k_ma\) unit typo. Preserve printed entries; use dimensional analysis in an approved implementation map |
| U-11 | P §§5–6 pp. 7–8 | First-cycle HER handling versus selected second-cycle fit is not fully reproducible; do not invent a cycle-dependent schedule |
| U-12 | P Figs. 2–4 pp. 7–10 | No raw time-series/error bars provided as machine-readable data in attachments; obtain raw data or document figure digitization |
| U-13 | O §28; P §6.2 pp. 10–11 | Efficiency voltage/cycle averaging and numerical acceptance thresholds not specified; define reporting convention before comparisons |
| U-14 | P §6.4 p. 12 | Mixed electrolyte says 0.6 M ZnCl2 and 0.6 M Cl−; stoichiometric dissociation would give 1.2 M Cl−. Flag and resolve; do not silently change |
| U-15 | P §5 p. 7 | Finite-element/time-solver details absent. Matching mesh count/tolerances cannot establish equivalence |
| U-16 | O §§31–33,41–42; P §§6.1/6.3 | No validated general parameter dependence on flow/temperature/structure or precipitation/degradation laws; extensions need new sources and experiments |

All main printed equations were legible after visual review. These unresolved items concern meaning, consistency or omitted closure, not permission to invent missing formulas. Links to implementation proposals and tests: [numerics](NUMERICAL_METHOD.md), [register](PARAMETER_REGISTER.md), [validation](VALIDATION_PLAN.md), [roadmap and traceability](IMPLEMENTATION_ROADMAP.md).
