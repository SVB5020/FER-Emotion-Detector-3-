import pytest
import numpy as np
from unittest.mock import patch, MagicMock
import realtimedetection  # Adjust if your script is named differently

@pytest.fixture
def dummy_frame():
    # Create a dummy grayscale face image (48x48)
    return np.random.randint(0, 255, (48, 48), dtype=np.uint8)

@patch('emotiondetector.requests.post')
@patch('emotiondetector.emotion_model.predict')
@patch('emotiondetector.cv2.VideoCapture')
@patch('emotiondetector.face_cascade.detectMultiScale')
def test_emotion_detection_pipeline(mock_detect, mock_video, mock_predict, mock_post, dummy_frame):
    # Mock the return values
    mock_video.return_value.isOpened.return_value = True
    mock_video.return_value.read.side_effect = [
        (True, np.stack([dummy_frame]*3, axis=-1)),  # Convert dummy gray to BGR
        (False, None)
    ]
    mock_detect.return_value = [(10, 10, 48, 48)]  # One face detected
    mock_predict.return_value = np.array([[0, 0, 0, 1, 0, 0, 0]])  # 'happy'
    mock_post.return_value.status_code = 200
    mock_post.return_value.text = "OK"

    # Run the detection loop once
    with patch('emotiondetector.cv2.imshow'), patch('emotiondetector.cv2.waitKey', return_value=ord('q')), patch('emotiondetector.cv2.destroyAllWindows'):
        realtimedetection.cap = mock_video.return_value
        realtimedetection.emotion_detected = False
        realtimedetection.face_cascade.detectMultiScale = mock_detect

        realtimedetection.emotion_model.predict = mock_predict
        realtimedetection.requests.post = mock_post

        # Start detection loop
        realtimedetection.main_loop = True  # Add this flag in your original script if you want
        realtimedetection.cap.read()
        assert realtimedetection.emotion_model.predict(np.zeros((1, 48, 48, 1))).shape == (1, 7)
        assert mock_post.called
