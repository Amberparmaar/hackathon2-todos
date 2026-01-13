# Deployment Guide: Phase II Full-Stack Multi-User Web Application

## Task Reference: T-BONUS-003
## Spec Reference: @phase2/specs/plan.md - Deliverables Confirmation section

## Overview
This guide provides comprehensive instructions for deploying the Phase II Full-Stack Multi-User Web Application to production environments. The application consists of a Next.js frontend and FastAPI backend with Neon PostgreSQL database.

## Deployment Architecture

### Components
- **Frontend**: Next.js 16+ application (static assets)
- **Backend**: FastAPI server with async database connections
- **Database**: Neon PostgreSQL (production) or SQLite (development)
- **Authentication**: JWT-based with BETTER_AUTH_SECRET
- **Reverse Proxy**: Nginx or cloud provider load balancer

### Infrastructure Requirements
- Web server capable of serving static files (frontend)
- Python 3.11+ runtime (backend)
- PostgreSQL database (Neon recommended)
- SSL certificate for HTTPS
- Environment configuration management

## Production Environment Setup

### Backend Environment Variables
````
# Database Configuration
DATABASE_URL=postgresql://username:password@endpoint:port/database_name
# For Neon: postgresql://neondb_owner:secret@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-production-secret-key-here

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Logging
LOG_LEVEL=INFO
````

### Frontend Environment Variables
````
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Authentication
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-production-secret-key-here
````

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend Deployment (Vercel)
1. **Connect to Vercel Dashboard**
   - Visit https://vercel.com
   - Connect your GitHub repository
   - Import the `phase2/frontend` directory

2. **Configure Build Settings**
   ````
   Framework: Next.js
   Root Directory: phase2/frontend
   ````

3. **Set Environment Variables**
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_BETTER_AUTH_SECRET`: Production secret

4. **Deploy**
   - Vercel will automatically build and deploy on pushes to main branch

#### Backend Deployment (Railway)
1. **Install Railway CLI**
   ````
   npm install -g @railway/cli
   ````

2. **Login and Initialize**
   ````
   railway login
   cd phase2/backend
   railway init
   ````

3. **Link to Project**
   ````
   railway link
   ````

4. **Set Environment Variables**
   ````
   railway vars set DATABASE_URL "your-postgres-url"
   railway vars set BETTER_AUTH_SECRET "your-secret"
   ````

5. **Deploy**
   ````
   railway up
   ````

### Option 2: Docker Containers with Docker Compose

#### 1. Create Dockerfile for Backend
````
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
````

#### 2. Create Dockerfile for Frontend
````
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
````

#### 3. Create docker-compose.yml
````
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${FRONTEND_API_URL}
      - NEXT_PUBLIC_BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: todo_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
````

#### 4. Deploy with Docker Compose
````
# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@db:5432/todo_app
export BETTER_AUTH_SECRET=your-production-secret
export FRONTEND_API_URL=http://backend:8000

# Start services
docker-compose up -d
````

### Option 3: Kubernetes Deployment

#### 1. Create Kubernetes Manifests

**PostgreSQL StatefulSet**:
````
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "todo_app"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
````

**Backend Deployment**:
````
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database_url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: auth_secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
````

**Frontend Deployment**:
````
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend-service:80"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
````

#### 2. Deploy to Kubernetes
````
# Apply manifests
kubectl apply -f postgres-statefulset.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Wait for deployments
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
````

## Production Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured securely
- [ ] Database migration scripts ready and tested
- [ ] SSL certificates obtained and configured
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security scanning passed

### Deployment Process
- [ ] Deploy to staging environment first
- [ ] Run integration tests in staging
- [ ] Verify all endpoints are accessible
- [ ] Test user authentication flow
- [ ] Test task CRUD operations
- [ ] Verify user isolation works
- [ ] Deploy to production
- [ ] Monitor application health
- [ ] Verify all functionality works in production

### Post-Deployment
- [ ] Monitor application performance
- [ ] Set up alerts for errors and performance issues
- [ ] Verify backup jobs are running
- [ ] Update DNS records if needed
- [ ] Document deployment changes
- [ ] Notify stakeholders of deployment

## Health Check and Monitoring

### Backend Health Endpoints
- `/health` - Returns application and database status
- `/metrics` - Prometheus metrics (if configured)
- `/docs` - API documentation

### Frontend Health Checks
- Homepage loads successfully
- Authentication flow works
- API calls return expected responses
- All UI components render correctly

## Rollback Procedures

### Automated Rollback
1. **Monitor health metrics**
2. **Trigger rollback if thresholds exceeded**
3. **Revert to previous stable version**
4. **Notify team of rollback**

### Manual Rollback
1. **Identify stable previous version**
2. **Deploy previous version**
3. **Verify functionality**
4. **Monitor for stability**

## Backup and Recovery

### Database Backup
````
# Regular automated backups
pg_dump --verbose --clean --no-owner --no-privileges --format=custom \
  --dbname=$DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).dump

# Restore from backup
pg_restore --verbose --clean --no-owner --no-privileges \
  --dbname=$DATABASE_URL backup-file.dump
````

### Application Backup
- Code repository (Git)
- Configuration files
- Environment variables/secrets
- SSL certificates

## Performance Optimization

### Backend Optimizations
- Enable Gunicorn workers for production
- Implement database connection pooling
- Add caching layer (Redis recommended)
- Optimize database queries with indexes
- Enable compression for API responses

### Frontend Optimizations
- Enable gzip compression
- Implement lazy loading for components
- Optimize images and assets
- Use CDN for static assets
- Implement service worker for offline capability

## Security Best Practices

### Authentication Security
- Use strong, randomly generated BETTER_AUTH_SECRET
- Implement rate limiting for auth endpoints
- Use HTTPS for all communications
- Implement secure session management
- Regular security audits of auth code

### Data Security
- Encrypt sensitive data at rest
- Use parameterized queries to prevent SQL injection
- Implement proper input validation
- Regular security scanning
- Keep dependencies updated

## Troubleshooting Production Issues

### Common Issues
1. **Database Connection Issues**
   - Check connection pool settings
   - Verify database credentials
   - Monitor connection limits

2. **Authentication Problems**
   - Verify JWT secret consistency
   - Check token expiration settings
   - Validate CORS configuration

3. **Performance Issues**
   - Monitor database query performance
   - Check for memory leaks
   - Verify caching configuration

### Monitoring Tools
- Application performance monitoring (APM)
- Log aggregation and analysis
- Database performance monitoring
- Infrastructure monitoring
- User experience monitoring

## Scaling Recommendations

### Horizontal Scaling
- Add more backend instances behind load balancer
- Use connection pooling for database connections
- Implement caching to reduce database load
- Use CDN for static assets

### Vertical Scaling
- Increase instance resources (CPU/RAM)
- Optimize database performance
- Improve code efficiency
- Use faster storage solutions

This deployment guide ensures the Phase II Full-Stack Multi-User Web Application can be reliably deployed to production environments with proper monitoring, security, and scaling considerations.