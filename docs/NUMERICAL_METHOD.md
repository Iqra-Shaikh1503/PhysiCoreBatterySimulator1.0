# Physicore Battery Lab Numerical Method Assessment

This is a proposed Python implementation strategy, not a reproduction result. [SCIENTIFIC_MODEL.md](SCIENTIFIC_MODEL.md) retains the printed science; [PARAMETER_REGISTER.md](PARAMETER_REGISTER.md) records missing inputs; [VALIDATION_PLAN.md](VALIDATION_PLAN.md) defines future evidence.

## 1 What COMSOL information establishes

**Published:** P §5 p. 7 reports finite elements, 4,150 mesh elements, relative tolerance 1e−3, absolute tolerance 1e−4, and mesh-refinement comparisons of voltage/concentration. It does not report element families/order, local mesh spacing, exact time integration, nonlinear algorithm, variable scales, linear preconditioner, or full boundary implementation.

**Assessment:** a SciPy finite-volume, finite-difference or finite-element implementation is independently implemented science. Even a Python FEM model with the same element count and tolerance numbers can differ in equations, fluxes, quadrature, degrees of freedom and error norms. Matching those numbers alone cannot establish COMSOL reproduction. Independent verification and data comparisons are required.

## 2 Nature of the coupled problem

Species and tank inventories evolve in time. Potentials and electroneutrality are constraints that must hold at the same time. In plain terms, some unknowns have a “rate of change” equation, while others must satisfy an instantaneous balance. This produces a differential-algebraic system (DAE), not automatically an ordinary ODE.

**Proposed abstract residual**, not a paper equation:

$$\mathcal F(t,u,\dot u)=0,\qquad
u=(c_-,c_+,c_{tank,-},c_{tank,+},\Gamma_{Zn},\phi_{e,-},\phi_{e,+},\phi_m,\phi_{s,+},v_-,P_-,P_+).$$

Surface Ce variables can be evaluated with E23–E26, or retained as local algebraic states to avoid unstable quotients near depletion. \(\Gamma_{Zn}\) here is a proposed surface inventory; mapping it to paper \(c_{Zn}\) is blocked by U-03. Flow may later be precomputed for fixed properties after validating that reduction against transient flow; the paper's negative momentum equation must not be silently changed to steady flow.

A mass matrix has nonzero storage rows for aqueous concentrations, tanks, Zn and transient velocity, and zero rows for algebraic constraints. Remove algebraic redundancy deliberately: E07/E08 are current identities, not additional independent equations to stack indiscriminately; E20/E21 and their closed forms E23/E24 should not be imposed redundantly.

## 3 Spatial discretization comparison

| Approach | Strength | Main risk for this model | Appropriate role |
| --- | --- | --- | --- |
| Structured finite differences | Simple derivative stencils; transparent learning examples | Interface flux conservation and discontinuous coefficients need special treatment; naive centered advection oscillates | Analytic checks and early 1-D transport exercises |
| Cell-centered finite volumes | Tracks each cell inventory and shared face flux; natural cell/tank mass conservation; upwind transport is accessible | Custom coupled potential/interface and flow implementation; numerical diffusion; cannot claim paper's FEM | Recommended independent 1-D reference prototype; viable later backend if it passes all checks |
| Continuous finite elements, Python DOLFINx | Weak forms, tagged multidomain meshes, mixed flow/potential fields; closest method family to P | Standard Galerkin advection can produce oscillations/negative concentrations; local conservation and stabilization require proof | Recommended full 2-D research backend after verification |
| Discontinuous Galerkin or mixed flux FEM | Face fluxes and local conservation can be explicit | More unknowns and complicated interfaces/limiters | Consider if continuous FEM fails local inventory or positivity checks |

**Recommendation:** use small conservative finite-volume problems as reference benchmarks, then develop the full 2-D model with DOLFINx/UFL/PETSc if the platform and team can support it. Keep the science API independent of the discretization. If a SciPy-only path is preferred, extend conservative finite volumes and identify it as an independent discretization; do not implement an ad hoc dense PDE solve.

The numerical library supplies assembly and solver tools, not this battery's physical closures. DOLFINx documents its PETSc-backed linear and nonlinear problem interfaces in its [official FEM API](https://docs.fenicsproject.org/dolfinx/main/python/generated/dolfinx.fem.petsc.html). Pin a tested release; the linked main documentation is a moving development branch. Linux/WSL deployment feasibility on the user's Windows machine must be checked during setup, not assumed or installed in Phase 0.

## 4 Transport, flow and interface representation

**Proposed:**

1. Tag negative fluid, membrane, positive porous region, collectors, inlets, outlets and interface sides by semantic names. Resolve U-01 before converting labels to coordinates.
2. Resolve the 180 μm membrane with a distinct mesh/submesh. Do not equate 4,150 elements with adequate membrane resolution; vary across-thickness resolution separately.
3. Negative flow uses a stable velocity/pressure pair (for example a reviewed Taylor–Hood choice) or validated staggered finite-volume method. Treat wall no-slip/no-penetration as proposed closures because Table 2 is incomplete.
4. Darcy flux and porous species storage must use compatible velocities: E11's printed \(\vec v c\) and B1's cross-sectional flow suggest a superficial-velocity convention that must be checked. Do not multiply storage or convection by porosity twice.
5. In a finite-volume reference, start with first-order upwind convection and centered diffusion. Measure artificial diffusion before adopting higher-order limited reconstruction.
6. Electrical migration is another drift flux. Use an explicitly oriented flux; explore exponential fitting/Scharfetter–Gummel-style face fluxes on simple 1-D cases as a **candidate**, not an untested claim of general positivity.
7. For continuous FEM, test stabilization (such as SUPG) on manufactured advection/migration solutions. Stabilization alone does not guarantee positive concentrations or exact elementwise mass conservation.
8. Use discontinuous interface potentials or a jump formulation for Donnan conditions. A continuous potential field across an interface would erase B5's prescribed jump.
9. Enforce membrane current continuity and non-proton blocking through a single shared oriented interface flux. Common-normal equality differs from equal outward-normal signs.

## 5 Time integration

| Option | Assessment |
| --- | --- |
| Explicit Euler / explicit Runge–Kutta | Useful for small nonstiff teaching examples; diffusion and electrochemical stiffness can demand very small steps; unsuitable default for the full model |
| Implicit backward Euler | Robust first milestone; nonlinear solve every step; first-order temporal error must be measured |
| Implicit BDF2 / variable-order BDF | Efficient candidate for smooth stiff phases after backward-Euler verification; more history and event restart complexity; positivity not automatic |
| Implicit Radau | Suitable stiff ODE benchmark candidate; expensive stages and no native constraint treatment through solve_ivp's ordinary ODE interface |
| DAE-oriented implicit integrator | Preferred for unreduced coupled constraints; needs consistent initial conditions, Jacobian and residual scaling |

SciPy [solve_ivp](https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html) documents BDF/Radau for stiff ODEs, sparse Jacobian support and event detection. Its stated interface is \(\dot y=f(t,y)\); it is not a general residual DAE interface. Use it only after algebraic elimination/reduction is explicit and independently checked. Solving potentials inside each RHS call adds inner-solve error and cost; ensure derivative/Jacobian evaluation includes that dependence.

PETSc [TS](https://petsc.org/release/manual/ts/) supplies ODE/DAE integration infrastructure. **Proposed full backend:** implicit residual formulation with consistent constraints, backward Euler first and a verified higher-order integrator later. DAE index and independence of constraints must be established; availability of a DAE solver is not proof that the formulated system is well posed.

Initialize by solving algebraic constraints with fixed admissible concentrations and declared Zn/velocity state. U-03/U-04 block an exact published initialization. Never “initialize” potentials by setting every field to zero and assuming the Donnan/Nernst conditions hold.

## 6 Nonlinear coupling

**Proposed default:** solve all electrochemical fields, reservoir states and Zn inventory together at each implicit step, with a damped Newton method. This repeatedly updates guesses until transport and reactions agree at the same new time. Flow can be a separate verified block when its properties are fixed.

A segregated alternative solves transport, potentials and kinetics in turns. It is acceptable only with inner iteration to a common residual and comparison to a monolithic reference. One pass through the overview's arrows is operator splitting and can create timestep-dependent charge/mass error.

Build scaled residual blocks so volts, mol/m3 and m/s do not compete by raw magnitude. Scale unknowns and residuals separately, document the scales, and use physically chosen absolute tolerances per variable. The paper's absolute tolerance cannot be copied without its scaling context.

Provide analytic or automatic-differentiation Jacobians where possible. Compare Jacobian-vector products with directional finite differences on small positive states; sparse approximations must include tank/interface couplings. Protect exponential evaluation using mathematically justified stable forms, line searches and step rejection. Hard clipping BV exponents changes kinetics and must not be an invisible “stability fix”.

PETSc [SNES](https://petsc.org/release/manual/snes/) documents nonlinear solvers. Proposed use of damped Newton, residual monitoring and later block strategies remains subject to battery-specific verification.

## 7 Sparse linear systems

Begin on small meshes with sparse direct factorization to establish a trustworthy linear reference. SciPy [spsolve](https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.linalg.spsolve.html) solves sparse \(Ax=b\); it does not assemble a PDE, enforce constraints or establish nonlinear convergence.

For larger nonsymmetric transport/kinetic Jacobians, assess GMRES with block preconditioning and physics-specific approximations. Conjugate gradient is suitable only for proven symmetric positive-definite subblocks, not the arbitrary coupled Jacobian. Flow saddle-point blocks and near-null potential gauges require special treatment; ground fixes electric gauge, pressure boundaries fix pressure reference.

Measure linear residuals, nonlinear residuals, fill-in, memory and timings. Never build a dense inverse. Reuse matrix structure or preconditioners only when the changing coefficients permit it; record failures and rebuild conditions.

## 8 Boundary implementation

| Boundary type | Proposed treatment and required verification |
| --- | --- |
| Inlet concentration | Uniform spatial Dirichlet value from dynamic tank at the same implicit step |
| Inlet flow / outlet pressure | Use B1/B2 on correct tags; verify prescribed total flow |
| Outlet species | Enforce zero diffusive flux as printed; derive electrical/advective flux treatment explicitly, not zero total flux |
| Negative reactive wall | Shared Faradaic Zn/H+ flux map tied to reaction currents and metal inventory |
| Membrane interfaces | Donnan jump, same oriented current, zero non-proton flux, proton-current relation after U-02 resolution |
| Positive collector | Electronic applied-current magnitude/sign; no electrolyte flow through collector needs an explicit boundary closure |
| Unspecified external walls | Proposed insulating/no-penetration conditions with source/deviation labels; review before full reproduction |
| Ground | One negative-solid potential datum, compatible with half-cell reference conversion |

All Neumann fluxes need documented outward normal, units and 2-D width factor. The tank receives precisely the flux leaving the cell; independent approximations on each side would break conservation.

## 9 Positivity and depletion

Nonnegative concentrations are physical constraints. An implicit method can still produce negative values, especially near sharp discharge termination. Proposed controls: conservative transport fluxes, limited Newton updates, timestep rejection/reduction, and local depletion event checks. Record minima over the entire domain, not only the tank.

Do not clip negative concentrations to zero after a step: clipping adds material and can break charge balance. Log-concentration variables enforce strict positivity but complicate exact zeros, inventory conservation and nonlinear conditioning. They are an option for comparison, not the default solution to depletion.

The 0.001 M Ce(IV) seed is an initial paper regularization. It does not justify imposing that floor everywhere at every step. Separate published initialization from proposed algebraic stabilization. Validate any equivalent surface-kinetic reformulation against E17/E20/E21 on positive inputs and its limiting behavior.

At Zn exhaustion, prevent inventory from becoming negative; define whether cutoff is reached first or another equation becomes invalid. Do not continue Zn dissolution with an unphysical negative inventory.

## 10 Stability and convergence evidence

Three different questions must be answered:

1. Did the algebraic/nonlinear iteration converge on this mesh and time step?
2. Does the solution approach a stable numerical limit as mesh/time error is reduced?
3. Does the model agree with independent experiments in its intended conditions?

Passing one does not establish the others. Monitor cell and tank atom inventories, Faradaic charge, total current, potential gauges, positivity, residuals and event locations. Use scaled norms with dimensionally consistent normalizers.

Refine mesh and timestep independently before a combined study. Compare voltage before transitions, event times, cumulative energy, surface concentrations, membrane current and Zn inventory. Error near a discontinuity should not be hidden by arbitrary curve alignment. Use at least three refinement levels; report observed order only when there is a credible asymptotic trend. Exact acceptance thresholds remain proposals in VALIDATION_PLAN.md.

## 11 Charge/discharge events and outputs

End charge exactly at 3600 s, restart time integration with reversed current, and locate the first downward crossing of Vcell−0.5 V during discharge. Retain material states across switches and cycles. Recompute algebraic potentials after switching; do not force voltage continuity at a current jump.

Adaptive time steps need smaller bounds near depletion and abrupt switching, and larger bounds only where error estimation permits. Output sampling times are separate from accepted internal steps. If the discharge starts at/below cutoff, report a zero-duration/unavailable discharge according to a documented policy; do not force integration through it.

Results should contain mesh, solver version, accepted/rejected steps, tolerances, conservation measures, model mode, parameter provenance, unresolved closures and failure reason. Store spatial fields separately from compact dashboard series.

## 12 Recommendation and prerequisites

First implement a versioned baseline/units/species layer and independently tested local equation kernels. Full cell integration waits for the sign, Zn inventory, initial neutrality and voltage-accounting decisions U-01–U-09. Then validate a closed cell–tank transport benchmark, followed by coupled 1-D tests, before 2-D assembly.

Independently verify: algebraic equivalence, dimensional consistency, sign/normal maps, conservation, positivity, Jacobians, integration order, mesh error, reference potential/voltage definitions and experimental comparisons. Keep paper-parameter reproduction separate from any later refit.

Official tool references above inform library capability only. The battery-specific numerical choices in this document are engineering proposals; none has been implemented, benchmarked or validated in Phase 0.
