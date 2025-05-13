import pytest
import numpy as np
from unittest.mock import patch
import os
import sys

# Add the path to the face_emotion_detection directory dynamically
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'face_emotion_detection'))
import realtimedetection  # Ensure this matches your actual filename (without .py)


@pytest.fixture
def dummy_rgb_frame():
    """Create a dummy color frame of size (224, 224, 3)."""
    return np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)


@patch('realtimedetection.requests.post')
@patch('realtimedetection.emotion_model.predict')
@patch('realtimedetection.cv2.VideoCapture')
@patch('realtimedetection.cv2.CascadeClassifier')
def test_emotion_detection_pipeline(mock_cascade, mock_video, mock_predict, mock_post, dummy_rgb_frame):
    """Test the end-to-end emotion detection pipeline."""
    # Mock webcam behavior
    mock_video.return_value.isOpened.return_value = True
    mock_video.return_value.read.side_effect = [
        (True, dummy_rgb_frame),  # First frame
        (False, None)             # Exit condition
    ]

    # Mock face detection (one face found)
    mock_cascade_instance = mock_cascade.return_value
    mock_cascade_instance.detectMultiScale.return_value = [(10, 10, 100, 100)]

    # Mock model prediction (predicts 'happy')
    mock_predict.return_value = np.array([[1.0, 0.0, 0.0]])  # Must match EMOTION_LABELS: ['happy', 'neutral', 'sad']

    # Mock backend response
    mock_post.return_value.status_code = 200
    mock_post.return_value.text = "OK"

    # Patch OpenCV GUI functions so they don't block or crash test
    with patch('realtimedetection.cv2.imshow'), \
         patch('realtimedetection.cv2.waitKey', return_value=ord('q')), \
         patch('realtimedetection.cv2.destroyAllWindows'):
        
        realtimedetection.cap = mock_video.return_value
        realtimedetection.emotion_detected = False

        # Simulate one iteration of detection
        ret, frame = realtimedetection.cap.read()
        assert ret, "Failed to read frame from mock video capture."

        # Normalize and reshape input for prediction
        reshaped_input = np.expand_dims(frame, axis=0) / 255.0
        pred = realtimedetection.emotion_model.predict(reshaped_input)

        # Assert prediction
        assert len(pred[0]) == 3, "Prediction output does not match expected label size."
        assert np.argmax(pred[0]) == 0, "Prediction did not identify 'happy' as the dominant emotion."

        # Assert backend communication
        mock_post.assert_called_once()
        assert mock_post.return_value.status_code == 200, "Backend did not return a successful response."
