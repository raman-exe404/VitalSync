"""
VitalSync - Synthetic Dataset Generator
Generates realistic sickle cell pain crisis risk data
"""

import numpy as np
import pandas as pd

np.random.seed(42)

def generate_dataset(n=5000):
    genotypes = np.random.choice(
        ["HbSS", "HbAS", "HbSC", "Unknown"],
        size=n,
        p=[0.35, 0.30, 0.25, 0.10]
    )

    # Wider ranges to cover real-world extremes
    water_intake = np.random.uniform(0.0, 5.0, n)
    sleep_hours  = np.random.uniform(2.0, 12.0, n)
    stress_level = np.random.uniform(0.0, 10.0, n)
    pain_level   = np.random.uniform(0.0, 10.0, n)
    temperature  = np.random.uniform(5.0, 45.0, n)
    humidity     = np.random.uniform(10.0, 100.0, n)

    # --- Risk scoring logic (tightened thresholds) ---
    score = np.zeros(n)

    # Hydration: low water → higher risk (max contribution ~7.5)
    score += (5.0 - water_intake) * 1.5

    # Sleep: poor sleep → higher risk (max contribution ~5)
    score += (12.0 - sleep_hours) * 0.5

    # Stress: high stress → higher risk (max contribution ~10)
    score += stress_level * 1.0

    # Pain: high pain → higher risk (max contribution ~12)
    score += pain_level * 1.2

    # Temperature: cold (<15°C) → higher risk
    score += np.where(temperature < 15, (15 - temperature) * 0.6, 0)

    # Humidity extremes → slight risk
    score += np.abs(humidity - 55) * 0.04

    # Genotype weights
    genotype_weight = {
        "HbSS":    8.0,   # highest risk
        "HbSC":    4.0,
        "Unknown": 2.5,
        "HbAS":    0.5,   # carrier — lowest risk
    }
    score += np.array([genotype_weight[g] for g in genotypes])

    # Small noise
    score += np.random.normal(0, 1.0, n)

    # Tighter thresholds → more HIGH predictions for extreme inputs
    # Score range: ~0 (best) to ~50+ (worst)
    def score_to_label(s):
        if s < 16:
            return "LOW"
        elif s < 24:
            return "MEDIUM"
        else:
            return "HIGH"

    risk_level = np.array([score_to_label(s) for s in score])

    df = pd.DataFrame({
        "water_intake": np.round(water_intake, 2),
        "sleep_hours":  np.round(sleep_hours, 1),
        "stress_level": np.round(stress_level, 1),
        "pain_level":   np.round(pain_level, 1),
        "temperature":  np.round(temperature, 1),
        "humidity":     np.round(humidity, 1),
        "genotype":     genotypes,
        "risk_level":   risk_level,
    })

    return df


if __name__ == "__main__":
    df = generate_dataset(5000)
    df.to_csv("data.csv", index=False)
    print(f"Dataset generated: {len(df)} rows")
    print(df["risk_level"].value_counts())
