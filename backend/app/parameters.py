from .schemas import Configuration, Review, Issue, BASELINE

def baseline():
    return Configuration(values=BASELINE)

def review(config: Configuration) -> Review:
    v = config.values.model_dump()
    messages = []
    negative = 2*v["znII"] + v["negativeH"] - v["negativeAnion"]
    positive = 3*v["ceIII"] + 4*v["ceIV"] + v["positiveH"] - v["positiveAnion"]
    for side, balance in (("Negative", negative), ("Positive", positive)):
        if abs(balance) > 1e-9:
            messages.append(f"{side} input charge imbalance: {balance:.6g} mol charge/L. Literal inputs preserved (U-04).")
    if v["cycles"] > 5:
        messages.append("More than five cycles exceeds the paper investigation horizon; precipitation is not modeled.")
    if v != BASELINE:
        messages.append("Modified scenario; published validation does not transfer to these inputs.")
    if abs(v["area"] - v["height"]*v["width"]/100) > 1e-6:
        messages.append("Active area differs from height x width / 100 in cm2; nothing was adjusted.")
    if config.mode == "discharge":
        messages.append("Initial discharge requires resolved zinc inventory (U-03); no inventory is assumed.")
    messages.append("Zn inventory, membrane sign, voltage conventions and material properties remain unresolved. Solver unavailable in Phase 2.")
    return Review(valid=True, issues=[Issue(severity="warning", message=m) for m in messages])

def to_si(config: Configuration):
    """Explicit SI snapshot; no electrochemical computation."""
    v = config.values.model_dump()
    result = dict(v)
    result.update(temperature=v["temperature"]+273.15, currentDensity=v["currentDensity"]*10,
                  flowRate=v["flowRate"]*1e-6/60, reservoirVolume=v["reservoirVolume"]*1e-6,
                  chargeDuration=v["chargeDuration"]*3600, height=v["height"]*1e-3,
                  width=v["width"]*1e-3, channel=v["channel"]*1e-3,
                  membrane=v["membrane"]*1e-6, area=v["area"]*1e-4)
    for key in ("znII", "negativeH", "negativeAnion", "ceIII", "ceIV", "positiveH", "positiveAnion"):
        result[key] *= 1000
    return result
