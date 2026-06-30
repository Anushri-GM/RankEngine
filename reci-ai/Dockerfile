# Multi-stage Dockerfile for RECI Full Stack
# Target stages: 'backend' or 'frontend'

# ==========================================
# Backend Service Stage
# ==========================================
FROM python:3.11-slim AS backend

WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend /app/backend

# Create cache and output directories
RUN mkdir -p /app/cache /app/outputs

ENV PORT=8000
ENV ENV=production
ENV MODEL_CACHE=/app/cache
ENV OUTPUT_PATH=/app/outputs

EXPOSE 8000

WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


# ==========================================
# Frontend Build Stage
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build


# ==========================================
# Frontend Production Stage (Web Server)
# ==========================================
FROM nginx:alpine AS frontend

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
