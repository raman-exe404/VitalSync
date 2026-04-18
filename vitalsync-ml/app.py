"""
VitalSync - Flask REST API
POST /predict → returns risk level
"""

import os
from flask import Flask, request, jsonify
from predict import predict_risk

app = Flask(__name__)


@app.route("/predict", methods=["POST"], strict_slashes=False)
def predict():
    data = request.get_json()

    # Basic validation
    required = [
        "water_intake", "sleep_hours", "stress_level",
        "pain_level", "temperature", "humidity", "genotype"
    ]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        result = predict_risk(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"], strict_slashes=False)
def health():
    return jsonify({"status": "ok", "service": "VitalSync ML"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
