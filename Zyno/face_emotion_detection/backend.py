import os
import platform
from flask import Flask, request, jsonify
import random

app = Flask(__name__)

MUSIC_BASE_DIR = "E:/4th SEM/Agile Project/Music-Recommendation-App/public/songs"  # Adjust the path
EMOTION_TO_LANGUAGE = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "neutral": "neutral",
}

def play_music(full_path):
    try:
        if platform.system() == "Windows":
            os.startfile(full_path)
            print(f"Backend: Attempting to play: {full_path} (Windows)")
            return True
        elif platform.system() == "Darwin":  # macOS
            subprocess.Popen(['open', full_path])
            print(f"Backend: Attempting to play: {full_path} (macOS)")
            return True
        elif platform.system() == "Linux":
            subprocess.Popen(['xdg-open', full_path])
            print(f"Backend: Attempting to play: {full_path} (Linux)")
            return True
        else:
            print(f"Backend: Unsupported operating system for direct file opening.")
            return False
    except FileNotFoundError:
        print(f"Backend: Error: Music file not found at {full_path}")
        return False
    except Exception as e:
        print(f"Backend: Error opening {full_path}: {e}")
        return False

@app.route('/play_category', methods=['POST'])
def play_category_route():
    data = request.get_json()
    if not data or 'category' not in data:
        return jsonify({"error": "Missing 'category' in request"}), 400

    detected_emotion = data['category'].lower()

    if detected_emotion in EMOTION_TO_LANGUAGE:
        language_folder = EMOTION_TO_LANGUAGE[detected_emotion]
        category_path = os.path.join(MUSIC_BASE_DIR, language_folder)
        if os.path.isdir(category_path):
            songs = [f for f in os.listdir(category_path) if os.path.isfile(os.path.join(category_path, f))]
            if songs:
                song_to_play = random.choice(songs)
                full_path = os.path.join(category_path, song_to_play)
                if play_music(full_path):
                    return jsonify({"message": f"Playing music for emotion '{detected_emotion}' ", "song": song_to_play})
                else:
                    return jsonify({"message": f"Could not play song: {song_to_play}"}), 500
            else:
                return jsonify({"message": f"No songs found in language '{language_folder}'"}), 200
        else:
            return jsonify({"message": f"Language folder '{language_folder}' not found"}), 404
    else:
        return jsonify({"error": f"No language mapping for emotion: {detected_emotion}"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)