# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory in Docker container
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Export port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000"]
