# Backend Dockerfile for Phase II Todo Application
# Multi-stage build for FastAPI backend with Cohere AI integration

# Stage 1: Builder - Install dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Copy requirements first for better caching
COPY phase2/backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runner - Production image
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY phase2/backend/server.py .
COPY phase2/backend/main.py .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 7860

# Set environment variables
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7860/health').read()" || exit 1

# Run the application
CMD ["python", "main.py"]
