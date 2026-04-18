"""
VitalSync - Model Training
Trains a Random Forest classifier and saves model + encoder
"""

import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

from generate_data import generate_dataset


def train():
    print("Generating dataset...")
    df = generate_dataset(5000)

    print("Risk distribution:")
    print(df["risk_level"].value_counts())

    # Encode genotype
    encoder = LabelEncoder()
    df["genotype_enc"] = encoder.fit_transform(df["genotype"])

    features = [
        "water_intake", "sleep_hours", "stress_level",
        "pain_level", "temperature", "humidity", "genotype_enc"
    ]
    X = df[features]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Random Forest — better generalisation on extreme values
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    joblib.dump(model,   "model.pkl")
    joblib.dump(encoder, "encoder.pkl")
    print("\nSaved: model.pkl, encoder.pkl")


if __name__ == "__main__":
    train()
