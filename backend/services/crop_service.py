def recommend_crops(data: dict):
    soil = str(data.get("soil_type", "")).lower()
    season = str(data.get("season", "")).lower()
    water = str(data.get("water_availability", "")).lower()

    recommendations = []

    if "red" in soil:
        recommendations += ["Groundnut", "Millets", "Pulses"]
    elif "black" in soil:
        recommendations += ["Cotton", "Sorghum", "Soybean"]
    elif "alluvial" in soil:
        recommendations += ["Rice", "Wheat", "Sugarcane"]
    else:
        recommendations += ["Millets", "Pulses", "Vegetables"]

    if "low" in water:
        recommendations = [c for c in recommendations if c not in {"Rice", "Sugarcane"}]

    if "kharif" in season:
        preferred = ["Groundnut", "Millets", "Cotton", "Pulses"]
        recommendations = preferred + [c for c in recommendations if c not in preferred]

    unique = list(dict.fromkeys(recommendations))[:5]

    return {
        "input": data,
        "recommendations": [
            {
                "crop": crop,
                "note": "Suitability is a general recommendation. Confirm local soil, rainfall, seed and market conditions before planting."
            }
            for crop in unique
        ]
    }
