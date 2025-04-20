import os
import tempfile
import shutil
import pytest
from app import app  # Adjust the import based on the actual backend file name

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def setup_music_dir(emotion_folder):
    temp_dir = tempfile.mkdtemp()
    emotion_path = os.path.join(temp_dir, emotion_folder)
    os.makedirs(emotion_path, exist_ok=True)
    dummy_song = os.path.join(emotion_path, "test_song.mp3")
    with open(dummy_song, "w") as f:
        f.write("Dummy content")
    return temp_dir, dummy_song

def test_play_category_valid_emotion(monkeypatch, client):
    temp_dir, dummy_song = setup_music_dir("happy")

    monkeypatch.setattr("app.MUSIC_BASE_DIR", temp_dir)
    monkeypatch.setattr("app.play_music", lambda x: True)

    response = client.post('/play_category', json={"category": "happy"})
    data = response.get_json()

    assert response.status_code == 200
    assert "Playing music for emotion" in data["message"]
    assert data["song"] == "test_song.mp3"

    shutil.rmtree(temp_dir)

def test_play_category_invalid_emotion(client):
    response = client.post('/play_category', json={"category": "confused"})
    data = response.get_json()
    assert response.status_code == 400
    assert "No language mapping" in data["error"]

def test_play_category_missing_category(client):
    response = client.post('/play_category', json={})
    data = response.get_json()
    assert response.status_code == 400
    assert "Missing 'category'" in data["error"]
