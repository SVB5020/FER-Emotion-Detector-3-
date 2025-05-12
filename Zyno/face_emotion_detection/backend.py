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

# Load model
model = load_model("best_model.h5")
emotion_classes = ["happy", "sad", "neutral"]

# Base directory where your songs are stored
MUSIC_BASE_DIR = r"C:\Users\Vishwanath BK\ScrumProject\FER\Zyno\Music-Recommendation-App\public\songs"
EMOTION_TO_FOLDER = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "neutral": "neutral",
}

def play_music(full_path):
    try:
        if platform.system() == "Windows":
            os.startfile(full_path)
        elif platform.system() == "Darwin":
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
        img_bytes = base64.b64decode(image_data.split(",")[1])
        img_np = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Image decoding failed")
        img = cv2.resize(img, (224, 224))
        img=img/255.0
        
        img = np.expand_dims(img, axis=0)
        
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

    folder_path = os.path.join(MUSIC_BASE_DIR, EMOTION_TO_FOLDER[emotion])
    if not os.path.isdir(folder_path):
        return jsonify({"error": f"No folder for emotion: {emotion}"}), 404

    songs = [f for f in os.listdir(folder_path) if f.endswith(".mp3")]
    if not songs:
        return jsonify({"message": "No songs found"}), 200

    song_to_play = random.choice(songs)
    full_path = os.path.join(folder_path, song_to_play)
    if play_music(full_path):
        return jsonify({"message": f"Playing {song_to_play}"})
    else:
        return jsonify({"message": "Playback failed"}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)

