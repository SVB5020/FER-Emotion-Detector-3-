# Step 1: Use a base image
FROM python:3.10-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy requirements file and install dependencies
COPY face_emotion_detection/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Step 4: Copy the rest of the application
COPY face_emotion_detection /app/face_emotion_detection

# Step 5: Expose port (if necessary)
EXPOSE 5000  

# Step 6: Command to run your application
CMD ["python", "face_emotion_detection/emotion_detector.py"]
