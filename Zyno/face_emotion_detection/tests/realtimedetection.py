import cv2
import numpy as np
from keras.models import load_model
import requests
import time  # Import the time module

# --- Configuration ---
MODEL_PATH = r"C:\Users\Vishwanath BK\ScrumProject\FER\Zyno\face_emotion_detection\best_model.h5"
HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
BACKEND_URL = "http://127.0.0.1:5000/play_category"
EMOTION_LABELS = [ 'happy', 'neutral', 'sad']
# --- End Configuration ---

# Load the pre-trained emotion detection model
try:
    emotion_model = load_model(MODEL_PATH)
except Exception as e:
    print(f"Error loading emotion detection model: {e}")
    exit()

# Load the Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
if face_cascade.empty():
    print("Error loading face cascade classifier.")
    exit()

# Open the webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Starting initial emotion detection...")

emotion_detected = False  # Flag to track if an emotion has been detected

while True:
    ret, frame = cap.read()
    if not ret or emotion_detected:  # Stop if no frame or emotion already detected
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        face_roi = gray[y:y + h, x:x + w]
        resized_face = cv2.resize(frame[y:y+h, x:x+w], (224, 224))  # color image, not grayscale
        normalized_face = resized_face / 255.0
        reshaped_face = np.expand_dims(normalized_face, axis=0)  # shape: (1, 224, 224, 3)


        try:
            pred = emotion_model.predict(reshaped_face)
            emotion_index = np.argmax(pred)
            detected_emotion = EMOTION_LABELS[emotion_index]
            cv2.putText(frame, detected_emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

            # --- Send detected emotion to backend and stop ---
            try:
                response = requests.post(BACKEND_URL, json={"category": detected_emotion.lower()})
                response.raise_for_status()
                print(f"Detected first emotion: {detected_emotion}, Sent to backend. Response: {response.text}")
                emotion_detected = True  # Set the flag to stop further detection
            except requests.exceptions.RequestException as e:
                print(f"Error communicating with backend: {e}")
            # --- End backend communication ---

        except Exception as e:
            print(f"Error during emotion prediction: {e}")

    cv2.imshow('Real-time Emotion Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

print("Emotion detection stopped. Song playback initiated.")
