# PMS Service - Quick Start Guide

This guide will help you get the PMS service up and running.

## Phase 1 Implementation Status

✅ **COMPLETED** - All Phase 1 files have been created!

### What's Implemented

1. **Project Structure** - Complete directory structure
2. **Configuration** - Settings, database, environment variables
3. **Logging** - Console and file logging with daily rotation
4. **Error Handling** - Standardized error responses
5. **JWT Authentication** - Integration with AUTH service
6. **Health Checks** - 3 health check endpoints
7. **Docker Support** - Dockerfile and docker-compose.yml
8. **Bootstrap** - Auto-create MongoDB collections and indexes
9. **Seed Data** - Sample data loading (configurable)
10. **Documentation** - README, CONTRIBUTING, CHANGELOG, LICENSE

---

## Quick Start Steps

### Step 1: Install Dependencies

```bash
# Activate your virtual environment
.\env\Scripts\activate  # Windows
# source env/bin/activate  # Linux/Mac

# Install all dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment

The `.env` file is already created with default values. Update if needed:

```bash
# Edit .env file with your settings
# Key settings to verify:
# - MONGODB_URI
# - AUTH_SERVICE_URL
```

### Step 3: Start MongoDB

Ensure your MongoDB container is running:

```bash
# If using Docker, MongoDB should be accessible at:
# mongodb://admin:password123@localhost:27017/pms_db?authSource=admin
```

### Step 4: Start AUTH Service

Make sure AUTH service is running on port 5001:

```bash
# AUTH service should be accessible at:
# http://localhost:5001
```

### Step 5: Run PMS Service

```bash
# Option A: Using Python directly
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5002

# Option B: Using the main.py
python app/main.py
```

### Step 6: Verify Installation

Open your browser and visit:

- **Health Check**: http://localhost:5002/health
- **API Docs (Swagger)**: http://localhost:5002/docs
- **ReDoc**: http://localhost:5002/redoc

---

## Testing the Service

### 1. Test Health Endpoints

```bash
# Using curl or PowerShell
curl http://localhost:5002/health
curl http://localhost:5002/health/ready
curl http://localhost:5002/health/live
```

### 2. Run the Test Script

```bash
# Basic test (no authentication)
python tests/test_endpoints.py

# With authentication (get token from AUTH service first)
python tests/test_endpoints.py --token YOUR_JWT_TOKEN
```

### 3. Get JWT Token from AUTH Service

```bash
# Login to AUTH service
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jtdhamodharan@gmail.com","password":"NewPass123!@#"}'

# Copy the accessToken from response
```

---

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f pms

# Stop
docker-compose down
```

### Build Docker Image Manually

```bash
# Build
docker build -t pms-service:0.1.0 .

# Run
docker run -d \
  --name pms-service \
  -p 5002:5002 \
  --env-file .env.docker \
  pms-service:0.1.0
```

---

## Optional: Load Seed Data

To load sample data (5 products, 6 subcategories, 3 categories):

1. Edit `.env` file:
```env
LOAD_SEED_DATA=True
```

2. Restart the service - seed data will be loaded automatically on startup

---

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
1. Verify MongoDB is running: `docker ps` or `mongosh`
2. Check connection string in `.env`
3. Test connection: `mongosh "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin"`

### AUTH Service Connection Issues

**Problem**: JWT verification fails

**Solutions**:
1. Verify AUTH service is running: `curl http://localhost:5001/health`
2. Check AUTH_SERVICE_URL in `.env`
3. Verify network connectivity

### Port Already in Use

**Problem**: Port 5002 is already in use

**Solutions**:
1. Change APP_PORT in `.env` to another port (e.g., 5012)
2. Or stop the service using port 5002

### Import Errors

**Problem**: ModuleNotFoundError

**Solutions**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check you're in the PMS directory

---

## What's Next?

### Phase 2: Category & Sub-Category Management (Next Step)

After verifying Phase 1 is working, we'll implement:

- ✅ Category CRUD operations
- ✅ Sub-Category CRUD operations
- ✅ Auto-code generation
- ✅ Validations and business logic

### Check Application Logs

```bash
# If LOG_TYPE=CONSOLE (default)
# Logs appear in terminal

# If LOG_TYPE=FILE
# Check logs/ directory
tail -f logs/pms.log
```

---

## Useful Commands

```bash
# Check Python version
python --version  # Should be 3.12+

# List installed packages
pip list

# Test MongoDB connection
mongosh "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin"

# View MongoDB collections
# In mongosh:
use pms_db
show collections
db.categories.countDocuments()

# Stop all Docker containers
docker-compose down -v

# Rebuild Docker image
docker-compose up --build --force-recreate
```

---

## Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| APP_PORT | 5002 | Service port |
| LOG_LEVEL | INFO | DEBUG, INFO, WARNING, ERROR, CRITICAL |
| LOG_TYPE | CONSOLE | CONSOLE or FILE |
| MONGODB_URI | (see .env) | MongoDB connection string |
| AUTH_SERVICE_URL | http://localhost:5001 | AUTH service URL |
| RATE_LIMIT_ENABLED | False | Enable/disable rate limiting |
| LOAD_SEED_DATA | False | Load sample data on startup |

---

## Need Help?

- Review [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review API docs at http://localhost:5002/docs
- Check logs for error messages

---

**Status**: ✅ Phase 1 Complete - Ready to Run!
**Next**: Test the service, then proceed to Phase 2
