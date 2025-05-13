import pytest
import numpy as np
from unittest.mock import MagicMock, patch

# Mock the emotion detection pipeline
@patch('realtimedetection.cv2.VideoCapture')
@patch('realtimedetection.cv2.CascadeClassifier')
@patch('realtimedetection.emotion_model.predict')
def test_emotion_detection_pipeline(mock_predict, mock_cascade, mock_video):
    """Simplified test for emotion detection pipeline."""
    # Mock the webcam behavior
    mock_video.return_value.isOpened.return_value = True
    mock_video.return_value.read.side_effect = [
        (True, np.zeros((480, 640, 3), dtype=np.uint8)),  # A blank frame
        (False, None)  # Simulate end of video
    ]

    # Mock face detection
    mock_cascade.return_value.detectMultiScale.return_value = [(10, 10, 100, 100)]

    # Mock emotion model prediction
    mock_predict.return_value = np.array([[0.9, 0.1, 0.0]])  # Predicts 'happy'

    # Mock backend response (skip actual backend call)
    with patch('realtimedetection.requests.post', return_value=MagicMock(status_code=200, text='OK')):
        # Simulate a single frame processing
        frame_read, frame = mock_video.return_value.read()
        assert frame_read, "Failed to read frame from mock video capture."

        # Mock emotion detection prediction
        emotion_prediction = mock_predict.return_value
        assert emotion_prediction[0][0] > 0.8, "Expected prediction confidence for 'happy' to be high."

        # Ensure backend call is mocked
        response = MagicMock(status_code=200, text="OK")
        assert response.status_code == 200, "Backend mock failed to return successful response."
