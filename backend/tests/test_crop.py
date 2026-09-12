from services.crop_service import recommend_crops

def test_crop_recommendation():
    result = recommend_crops({
        "soil_type": "red soil",
        "season": "kharif",
        "water_availability": "moderate",
    })
    assert result["recommendations"]
