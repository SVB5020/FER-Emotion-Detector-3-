# File: Zyno/face_emotion_detection/tests/test_project.py

import pytest
from flask import Flask, jsonify, request

# Mock Flask app for testing
app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if data.get("username") == "test_user" and data.get("password") == "test_pass":
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if data.get("username") and data.get("password"):
        return jsonify({"message": "Signup successful"}), 201
    return jsonify({"message": "Invalid input"}), 400

# Pytest Fixture for Flask Client
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Test Cases
def test_music_recommendation():
    """Test a simple music recommendation logic."""
    emotion_to_music = {"happy": "pop", "neutral": "classical", "sad": "blues"}
    emotion = "happy"
    recommended_music = emotion_to_music.get(emotion, "unknown")
    assert recommended_music == "pop", f"Expected 'pop' for emotion 'happy', got '{recommended_music}'"

def test_login_api(client):
    """Test the login API endpoint."""
    response = client.post('/login', json={"username": "test_user", "password": "test_pass"})
    assert response.status_code == 200
    assert response.json["message"] == "Login successful"

    response = client.post('/login', json={"username": "wrong_user", "password": "wrong_pass"})
    assert response.status_code == 401
    assert response.json["message"] == "Invalid credentials"

def test_signup_api(client):
    """Test the signup API endpoint."""
    response = client.post('/signup', json={"username": "new_user", "password": "new_pass"})
    assert response.status_code == 201
    assert response.json["message"] == "Signup successful"

    response = client.post('/signup', json={"username": "", "password": ""})
    assert response.status_code == 400
    assert response.json["message"] == "Invalid input"
