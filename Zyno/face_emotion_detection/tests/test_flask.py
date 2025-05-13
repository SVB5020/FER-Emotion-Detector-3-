import os
import pytest
import shutil
from unittest.mock import patch
from backend import app  # Assuming your Flask app is in backend.py
import tempfile

@pytest.fixture
def client():
    """Fixture to configure the Flask test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def temp_music_dir():
    """Fixture to create and clean up a temporary music directory."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


def setup_music_dir(base_dir, emotion_folder):
    """Set up a temporary directory structure for a specific emotion."""
    emotion_path = os.path.join(base_dir, emotion_folder)
    os.makedirs(emotion_path, exist_ok=True)
    dummy_song = os.path.join(emotion_path, "test_song.mp3")
    with open(dummy_song, "w") as f:
        f.write("Dummy content")
    return dummy_song


def test_play_category_valid_emotion(monkeypatch, client, temp_music_dir):
    """Test the play_category endpoint with a valid emotion."""
    dummy_song = setup_music_dir(temp_music_dir, "happy")

    # Patch MUSIC_BASE_DIR and play_music in backend.py
    monkeypatch.setattr("backend.MUSIC_BASE_DIR", temp_music_dir)
    monkeypatch.setattr("backend.play_music", lambda x: True)

    response = client.post('/play_category', json={"category": "happy"})
    data = response.get_json()

    assert response.status_code == 200, "Expected status code 200 for a valid emotion."
    assert "Playing music for emotion" in data["message"], "Unexpected response message."
    assert data["song"] == "test_song.mp3", "The returned song does not match the dummy song."


def test_play_category_invalid_emotion(client):
    """Test the play_category endpoint with an invalid emotion."""
    response = client.post('/play_category', json={"category": "confused"})
    data = response.get_json()

    assert response.status_code == 400, "Expected status code 400 for an invalid emotion."
    assert "No language mapping" in data["error"], "Unexpected error message for invalid emotion."


def test_play_category_missing_category(client):
    """Test the play_category endpoint with a missing category."""
    response = client.post('/play_category', json={})
    data = response.get_json()

    assert response.status_code == 400, "Expected status code 400 for missing category."
    assert "Missing 'category'" in data["error"], "Unexpected error message for missing category."
