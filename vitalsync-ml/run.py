"""
VitalSync - One-command runner
Trains the model then starts the Flask API
"""

import subprocess
import sys

print("=== VitalSync ML Pipeline ===\n")

# Step 1: Train
print("[1/2] Training model...")
result = subprocess.run([sys.executable, "train.py"], check=True)

# Step 2: Start API
print("\n[2/2] Starting Flask API on http://localhost:5000")
print("      POST /predict  |  GET /health\n")
subprocess.run([sys.executable, "app.py"])
