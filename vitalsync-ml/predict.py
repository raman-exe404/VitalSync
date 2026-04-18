"""
VitalSync - Prediction Script
Loads saved model and predicts pain crisis risk from JSON input
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def predict_risk(input_json: dict) -> dict:
    """
    Predict sickle cell pain crisis risk.

    Args:
        input_json: dict with keys:
            water_intake, sleep_hours, stress_level, pain_level,
            temperature, humidity, genotype

    Returns:
        dict: { "risk": "LOW" | "MEDIUM" | "HIGH" }
    """
    model   = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    encoder = joblib.load(os.path.join(BASE_DIR, "encoder.pkl"))

    # Encode genotype — handle unseen values gracefully
    genotype = input_json.get("genotype", "Unknown")
    known_classes = list(encoder.classes_)
    if genotype not in known_classes:
        # Map common aliases
        alias = {
            "SS": "HbSS", "SC": "HbSC", "AS": "HbAS",
            "AA": "HbAA", "CC": "HbCC"
        }
        genotype = alias.get(genotype, known_classes[0])

    genotype_enc = encoder.transform([genotype])[0]

    features = pd.DataFrame([{
        "water_intake":  float(input_json["water_intake"]),
        "sleep_hours":   float(input_json["sleep_hours"]),
        "stress_level":  float(input_json["stress_level"]),
        "pain_level":    float(input_json["pain_level"]),
        "temperature":   float(input_json["temperature"]),
        "humidity":      float(input_json.get("humidity", 50)),
        "genotype_enc":  genotype_enc
    }])

    prediction = model.predict(features)[0]
    return {"risk": prediction}


if __name__ == "__main__":
    with open(os.path.join(BASE_DIR, "sample_input.json")) as f:
        sample = json.load(f)
    print("Input:", json.dumps(sample, indent=2))
    result = predict_risk(sample)
    print("Prediction:", result)
