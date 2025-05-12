# Step 1: Build the Frontend (Music-Recommendation-App)
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

<<<<<<< HEAD
# Install dependencies and build the frontend
COPY Music-Recommendation-App/package*.json ./
RUN npm install
COPY Music-Recommendation-App ./
RUN npm run build

# Step 2: Build the Backend (face_emotion_detection)
FROM python:3.10-slim AS backend

WORKDIR /app/backend

# Install OpenCV system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies
COPY face_emotion_detection/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code, including the model file
COPY face_emotion_detection /app/backend/face_emotion_detection

# Install gunicorn for running the backend
RUN pip install --no-cache-dir gunicorn

# Step 3: Combine Frontend and Backend into the Final Image
FROM python:3.10-slim

WORKDIR /app

# Install Node.js runtime and additional required tools
RUN apt-get update && apt-get install -y \
    curl procps libglib2.0-0 libsm6 libxext6 libxrender-dev && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g serve concurrently && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy backend and frontend from the build stages
COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend/.next /app/frontend/.next
COPY --from=frontend /app/frontend/public /app/frontend/public
COPY --from=frontend /app/frontend/package.json /app/frontend/package.json

# Install Python dependencies required for backend (like OpenCV, TensorFlow, and Keras)
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir opencv-python-headless tensorflow==2.13.0 keras==2.13.1 gunicorn


# Set environment variables for model path and music base directory
ENV MODEL_PATH=/app/backend/face_emotion_detection/best_model.h5
ENV MUSIC_BASE_DIR=/app/frontend/public/songs

# Expose the necessary ports for backend and frontend
EXPOSE 5000 3000

# Run the backend and frontend concurrently
CMD ["concurrently", "\"cd /app/backend && gunicorn -b 0.0.0.0:5000 face_emotion_detection.realtimedetection:app\"", "\"serve -s /app/frontend -l 3000\""]
=======
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
>>>>>>> 2301fa8284081528a62250937cb2042c0e70d8a0
