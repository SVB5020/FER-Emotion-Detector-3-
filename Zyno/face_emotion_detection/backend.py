from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
import numpy as np
import cv2
import base64
import os
import platform
import random
import subprocess

app = Flask(__name__)
CORS(app)

# --- Configuration ---
# Dynamically set the model path based on environment variables or defaults
if platform.system() == "Windows":
    DEFAULT_MODEL_PATH = r"C:\Users\Vishwanath BK\ScrumProject\FER\Zyno\face_emotion_detection\best_model.h5"
    DEFAULT_MUSIC_BASE_DIR = r"C:\Users\Vishwanath BK\ScrumProject\FER\Zyno\Music-Recommendation-App\public\songs"
else:
    DEFAULT_MODEL_PATH = "/app/backend/face_emotion_detection/best_model.h5"
    DEFAULT_MUSIC_BASE_DIR = "/app/backend/Music-Recommendation-App/public/songs"

# Use environment variables to override defaults
MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)
MUSIC_BASE_DIR = os.getenv("MUSIC_BASE_DIR", DEFAULT_MUSIC_BASE_DIR)

# Emotion-to-folder mapping
EMOTION_TO_FOLDER = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "neutral": "neutral",
}

# Load model
try:
    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading emotion detection model: {e}")
    raise

emotion_classes = ["happy", "sad", "neutral"]


def play_music(full_path):
    try:
        if platform.system() == "Windows":
            os.startfile(full_path)
        elif platform.system() == "Darwin":  # macOS
            subprocess.Popen(["open", full_path])
        elif platform.system() == "Linux":
            subprocess.Popen(["xdg-open", full_path])
        return True
    except Exception as e:
        print("Music playback error:", e)
        return False


@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    data = request.get_json()
    image_data = data.get('image')
    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Decode the base64 image
        img_bytes = base64.b64decode(image_data.split(",")[1])
        img_np = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Image decoding failed")

        # Preprocess the image for the model
        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        # Predict emotion
        prediction = model.predict(img)
        emotion = emotion_classes[np.argmax(prediction)]
        return jsonify({"emotion": emotion})
    except Exception as e:
        print(f"Error: {e}")  # Log the error to the server console
        return jsonify({"error": str(e)}), 500


@app.route('/play_category', methods=['POST'])
def play_category():
    data = request.get_json()
    emotion = data.get('category', '').lower()

    if emotion not in EMOTION_TO_FOLDER:
        return jsonify({"error": "Unsupported emotion"}), 400

    # Determine the folder path for the emotion
    folder_path = os.path.join(MUSIC_BASE_DIR, EMOTION_TO_FOLDER[emotion])
    if not os.path.isdir(folder_path):
        return jsonify({"error": f"No folder for emotion: {emotion}"}), 404

    # Get a list of songs in the folder
    songs = [f for f in os.listdir(folder_path) if f.endswith(".mp3")]
    if not songs:
        return jsonify({"message": "No songs found"}), 200

    # Choose a random song and play it
    song_to_play = random.choice(songs)
    full_path = os.path.join(folder_path, song_to_play)
    if play_music(full_path):
        return jsonify({"message": f"Playing {song_to_play}"})
    else:
        return jsonify({"message": "Playback failed"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)