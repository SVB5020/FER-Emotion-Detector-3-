# Step 1: Use a base image
FROM python:3.10-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy requirements file
COPY face_emotion_detection/requirements.txt /app/requirements.txt

# Step 4: Upgrade pip to the latest version
RUN pip install --no-cache-dir --upgrade pip

# Step 5: Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy the rest of the application
COPY face_emotion_detection /app/face_emotion_detection

# Step 7: Expose port (if necessary)
EXPOSE 5000  

# Step 8: Command to run your application
CMD ["python", "face_emotion_detection/emotion_detector.py"]
