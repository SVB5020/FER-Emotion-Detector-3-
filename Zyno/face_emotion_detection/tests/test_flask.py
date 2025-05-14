import pytest
from unittest.mock import patch
from Zyno.face_emotion_detection.backend import app

@pytest.fixture
def client():
    """Fixture to configure the Flask test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_play_category_valid_emotion(client):
    """Simplified test for valid emotion category."""
    with patch("backend.play_music", return_value=True):
        response = client.post('/play_category', json={"category": "happy"})
        data = response.get_json()

        assert response.status_code == 200, "Expected status code 200 for a valid emotion."
        assert "Playing music for emotion" in data["message"], "Unexpected response message."


def test_play_category_invalid_emotion(client):
    """Simplified test for invalid emotion category."""
    response = client.post('/play_category', json={"category": "confused"})
    data = response.get_json()

    assert response.status_code == 400, "Expected status code 400 for an invalid emotion."
    assert "No language mapping" in data["error"], "Unexpected error message."


def test_play_category_missing_category(client):
    """Simplified test for missing category."""
    response = client.post('/play_category', json={})
    data = response.get_json()

    assert response.status_code == 400, "Expected status code 400 for missing category."
    assert "Missing 'category'" in data["error"], "Unexpected error message."
