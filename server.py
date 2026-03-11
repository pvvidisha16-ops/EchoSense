from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from transformers import pipeline
from flask import Flask, request, jsonify
import json

app = Flask(__name__)
CORS(app)

# AI model (used as fallback)
classifier = pipeline("zero-shot-classification")

labels = [
"emergency",
"medical pain",
"need water",
"normal conversation"
]

alerts = []


def analyze_sentence(text):

    text = text.lower()

    # ----- Rule based detection -----

    emergency_words = [
    "fell",
    "fall",
    "help",
    "can't breathe",
    "cannot breathe",
    "choking",
    "emergency",
    "hungry",
    "problem",
    "danger",
    "accident"
    ]

    pain_words = [
    "pain",
    "hurt",
    "hurts",
    "back pain",
    "chest pain"
    ]

    water_words = [
    "water",
    "thirsty",
    "drink"
    ]

    for word in emergency_words:
        if word in text:
            return "emergency", 1.0

    for word in pain_words:
        if word in text:
            return "medical pain", 1.0

    for word in water_words:
        if word in text:
            return "need water", 1.0


    # ----- AI fallback -----

    result = classifier(text, labels)

    intent = result["labels"][0]
    score = result["scores"][0]

    if score < 0.6:
        intent = "normal conversation"

    return intent, score


@app.route("/alert", methods=["POST"])
def receive_alert():

    data = request.json

    patient_id = data["patient_id"]
    speech_text = data["speech"]

    intent, score = analyze_sentence(speech_text)

    # Ignore normal conversation
    if intent != "normal conversation":

        alerts.append({
            "patient_id": patient_id,
            "speech": speech_text,
            "intent": intent,
            "confidence": round(score*100,2),
            "time": datetime.now().strftime("%H:%M:%S")
        })

    return jsonify({
        "message":"processed",
        "intent":intent
    })


@app.route("/alerts/<patient_id>")
def get_alerts(patient_id):

    patient_alerts = [a for a in alerts if a["patient_id"] == patient_id]

    return jsonify(patient_alerts), 200


@app.route("/clear", methods=["POST"])
def clear_alerts():

    alerts.clear()

    return jsonify({"message":"alerts cleared"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
