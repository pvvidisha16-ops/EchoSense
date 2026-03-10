from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

alerts = []

@app.route("/alert", methods=["POST"])
def receive_alert():

    data = request.json

    alerts.append({
        "patient_id": data["patient_id"],
        "keyword": data["keyword"]
    })

    return jsonify({"message":"alert received"})


@app.route("/alerts/<patient_id>")
def get_alerts(patient_id):

    patient_alerts = [a for a in alerts if a["patient_id"] == patient_id]

    return jsonify(patient_alerts)


@app.route("/clear", methods=["POST"])
def clear_alerts():

    alerts.clear()

    return jsonify({"message":"alerts cleared"})


if __name__ == "__main__":
    app.run(port=5000)
