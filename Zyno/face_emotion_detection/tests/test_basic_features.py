import pytest
from Zyno.face_emotion_detection.app import app  # Replace with your actual app import path


@pytest.fixture
def client():
    """Fixture to configure the Flask test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_music_recommendation():
    """Test a simple music recommendation logic."""
    emotion_to_music = {"happy": "pop", "neutral": "classical", "sad": "blues"}
    emotion = "happy"
    recommended_music = emotion_to_music.get(emotion, "unknown")
    assert recommended_music == "pop", f"Expected 'pop' for emotion 'happy', got '{recommended_music}'"


def test_basic_login_api(client):
    """Test a simple login API endpoint."""
    response = client.post('/login', json={"username": "test_user", "password": "test_pass"})
    assert response.status_code == 200
    assert response.json["message"] == "Login successful"


def test_signup_api(client):
    """Test a simple signup API endpoint."""
    response = client.post('/signup', json={"username": "new_user", "password": "new_pass"})
    assert response.status_code == 201
    assert response.json["message"] == "Signup successful"
