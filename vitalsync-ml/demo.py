"""
VitalSync - Demo: runs predictions on multiple scenarios
"""

import json
from predict import predict_risk

cases = [
    {
        "label": "HIGH risk — HbSS, dehydrated, cold, stressed",
        "input": {
            "water_intake": 0.8,
            "sleep_hours": 3.5,
            "stress_level": 9,
            "pain_level": 8,
            "temperature": 12.0,
            "humidity": 80,
            "genotype": "HbSS"
        }
    },
    {
        "label": "MEDIUM risk — HbSC, moderate conditions",
        "input": {
            "water_intake": 1.8,
            "sleep_hours": 6.0,
            "stress_level": 5,
            "pain_level": 5,
            "temperature": 24.0,
            "humidity": 55,
            "genotype": "HbSC"
        }
    },
    {
        "label": "LOW risk — HbAS, well-hydrated, good sleep",
        "input": {
            "water_intake": 3.0,
            "sleep_hours": 8.5,
            "stress_level": 2,
            "pain_level": 1,
            "temperature": 28.0,
            "humidity": 50,
            "genotype": "HbAS"
        }
    },
    {
        "label": "HIGH risk — Unknown genotype, very poor conditions",
        "input": {
            "water_intake": 0.5,
            "sleep_hours": 3.0,
            "stress_level": 10,
            "pain_level": 9,
            "temperature": 10.0,
            "humidity": 90,
            "genotype": "Unknown"
        }
    },
    {
        "label": "LOW risk — HbSS but excellent self-care",
        "input": {
            "water_intake": 3.5,
            "sleep_hours": 9.0,
            "stress_level": 1,
            "pain_level": 1,
            "temperature": 30.0,
            "humidity": 45,
            "genotype": "HbSS"
        }
    },
]

print("=" * 55)
print("       VitalSync — Pain Crisis Risk Predictions")
print("=" * 55)

for case in cases:
    result = predict_risk(case["input"])
    risk = result["risk"]
    emoji = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(risk, "⚪")
    print(f"\n{emoji}  {risk}")
    print(f"   Scenario : {case['label']}")
    key_inputs = case["input"]
    print(f"   Inputs   : water={key_inputs['water_intake']}L  sleep={key_inputs['sleep_hours']}h  "
          f"stress={key_inputs['stress_level']}  pain={key_inputs['pain_level']}  "
          f"temp={key_inputs['temperature']}°C  genotype={key_inputs['genotype']}")

print("\n" + "=" * 55)
