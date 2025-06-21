# Use Python 3.11 slim image
FROM docker.1ms.run/python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libpq-dev \
        curl \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir  -i https://pypi.mirrors.ustc.edu.cn/simple  --upgrade pip \
    && pip install --no-cache-dir -i https://pypi.mirrors.ustc.edu.cn/simple -r requirements.txt

# Copy project
COPY . .

# Create uploads directory
RUN mkdir -p uploads/benchmarks

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]