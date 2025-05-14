import pytest
from unittest.mock import patch, MagicMock


def test_music_recommendation():
    """Test a simple music recommendation logic."""
    # Mock a list of emotions and their corresponding music categories
    emotion_to_music = {
        "happy": "pop",
        "neutral": "classical",
        "sad": "blues"
    }

    # Test for a valid emotion
    emotion = "happy"
    recommended_music = emotion_to_music.get(emotion, "unknown")
    assert recommended_music == "pop", f"Expected 'pop' for emotion 'happy', got '{recommended_music}'"

    # Test for an invalid emotion
    emotion = "confused"
    recommended_music = emotion_to_music.get(emotion, "unknown")
    assert recommended_music == "unknown", f"Expected 'unknown' for an invalid emotion, got '{recommended_music}'"


def test_basic_login_api(client):
    """Test a simple login API endpoint."""
    # Mock a login API response
    with patch("realtimedetection.requests.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {"message": "Login successful"})

        # Simulate a login request
        response = mock_post("http://127.0.0.1:5000/login", json={"username": "test_user", "password": "test_pass"})

        # Verify the response
        assert response.status_code == 200, "Expected status code 200 for a successful login"
        assert response.json()["message"] == "Login successful", "Unexpected response message for login"


def test_signup_api(client):
    """Test a simple signup API endpoint."""
    # Mock a signup API response
    with patch("realtimedetection.requests.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=201, json=lambda: {"message": "Signup successful"})

        # Simulate a signup request
        response = mock_post("http://127.0.0.1:5000/signup", json={"username": "new_user", "password": "new_pass"})

        # Verify the response
        assert response.status_code == 201, "Expected status code 201 for a successful signup"
        assert response.json()["message"] == "Signup successful", "Unexpected response message for signup"
