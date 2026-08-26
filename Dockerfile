FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY static/ ./static/
COPY generate_sample_images.py .

# Generate sample assets
RUN python generate_sample_images.py

EXPOSE 8080

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8080"]
