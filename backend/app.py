import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services.gemini_service import ask_gemini
from services.weather_service import get_weather
from services.crop_service import recommend_crops

load_dotenv()

app = Flask(
    __name__,
    template_folder="../frontend",
    static_folder="../frontend",
    static_url_path="/static",
)
CORS(app)

@app.get("/")
def home():
    return render_template("index.html")

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    language = str(data.get("language", "English")).strip()
    location = str(data.get("location", "")).strip()

    if not message:
        return jsonify({"success": False, "error": "Please enter a question."}), 400

    try:
        answer = ask_gemini(message, language, location)
        return jsonify({"success": True, "response": answer, "language": language})
    except Exception as exc:
        app.logger.exception("Chat error")
        return jsonify({"success": False, "error": str(exc)}), 500

@app.get("/api/weather")
def weather():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"success": False, "error": "City is required."}), 400
    try:
        return jsonify({"success": True, "data": get_weather(city)})
    except Exception as exc:
        app.logger.exception("Weather error")
        return jsonify({"success": False, "error": str(exc)}), 500

@app.post("/api/crop-recommendation")
def crop_recommendation():
    data = request.get_json(silent=True) or {}
    try:
        result = recommend_crops(data)
        return jsonify({"success": True, "data": result})
    except Exception as exc:
        app.logger.exception("Crop recommendation error")
        return jsonify({"success": False, "error": str(exc)}), 500

@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "API endpoint not found."}), 404
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
