# Traefik HTTPS Setup Prompt

Use this prompt to configure Traefik reverse proxy with automatic SSL certificate download in any Docker Compose project.

---

## Prompt:

I need to add Traefik reverse proxy to my Docker Compose project with the following requirements:

### Requirements:
1. **Traefik Version**: Use the latest stable version (v3.x)
2. **SSL Certificates**: Automatically download from GitHub at container startup
3. **Certificate Location**: https://github.com/iomegak12/deployment-artifacts/raw/refs/heads/main/certificates.zip
4. **Certificate Files**: The zip contains: `privkey.pem`, `cert.pem`, `chain.pem`, `fullchain.pem`
5. **HTTP to HTTPS**: All HTTP traffic should redirect to HTTPS
6. **Port Access**: Remove direct port-based access - only domain-based routing
7. **Dashboard**: Enable Traefik dashboard with HTTPS access

### Domain Configuration:
- `https://auth.lan-demos.work.gd` → AUTH Service (port 5001)
- `https://pms.lan-demos.work.gd` → PMS Service (port 5002)
- `https://web.lan-demos.work.gd` → Frontend Web App (port 80)
- `https://traefik.lan-demos.work.gd:8080` → Traefik Dashboard

### Technical Specifications:
- **Traefik Ports**: 
  - 80 (HTTP - redirects to HTTPS)
  - 443 (HTTPS)
  - 8080 (Dashboard)
- **Docker Network**: `wlan-network` (bridge)
- **Certificate Storage**: Named volume `traefik_certs`
- **GitHub Repo**: Public (no authentication needed)
- **Download Timing**: Every container startup

### Files to Create:

1. **traefik/Dockerfile**
   - Base image: Latest Traefik
   - Install: wget, unzip
   - Copy configuration files
   - Custom entrypoint script

2. **traefik/traefik.yml**
   - Static configuration
   - Entry points (web, websecure)
   - Docker provider
   - File provider for dynamic config
   - API dashboard enabled
   - HTTP to HTTPS redirect

3. **traefik/dynamic/certificates.yml**
   - TLS certificate configuration
   - Point to fullchain.pem and privkey.pem

4. **traefik/download-certs.sh**
   - Download certificates.zip from GitHub
   - Extract to /etc/traefik/certs
   - Validate required files exist
   - Set proper permissions
   - Start Traefik

5. **docker-compose.yml updates**
   - Add Traefik service with build context
   - Mount Docker socket (read-only)
   - Mount traefik_certs volume
   - Add Traefik labels to existing services:
     - Enable Traefik
     - Set Host rules
     - Configure entrypoints
     - Set loadbalancer ports
   - Change service ports from `ports:` to `expose:`
   - Add `depends_on: traefik` to all services
   - Create traefik_certs volume

### Existing Services to Configure:
- **auth-service**: Internal port 5001
- **pms-service**: Internal port 5002
- **wlan-web**: Internal port 80

### Important Notes:
- Use `expose:` instead of `ports:` for backend services
- All services must be on the same Docker network
- Traefik should start before other services (depends_on)
- DNS resolver: 127.0.0.11 for Docker internal DNS
- Certificate validation: Check fullchain.pem and privkey.pem exist

### Expected Behavior:
1. Container starts → Downloads certificates from GitHub
2. Extracts and validates certificate files
3. Traefik starts with SSL configured
4. HTTP requests redirect to HTTPS
5. Domain-based routing works for all services
6. Dashboard accessible via HTTPS

---

## Usage Instructions:

1. Copy this entire prompt
2. Paste to an AI assistant (like GitHub Copilot or ChatGPT)
3. Provide your existing docker-compose.yml structure
4. AI will create all necessary files and configurations
5. Build and deploy: `docker-compose build && docker-compose up -d`

---

## Validation Commands:

```bash
# Check if Traefik is running
docker ps | grep traefik

# View Traefik logs
docker logs traefik

# Check certificate download
docker exec traefik ls -lh /etc/traefik/certs

# Test HTTPS redirect
curl -I http://your-domain.com

# Access dashboard
https://traefik.lan-demos.work.gd:8080
```

---

## DNS Configuration Required:

Point all domains to your server IP:
```
auth.lan-demos.work.gd    → YOUR_SERVER_IP
pms.lan-demos.work.gd     → YOUR_SERVER_IP
web.lan-demos.work.gd     → YOUR_SERVER_IP
traefik.lan-demos.work.gd → YOUR_SERVER_IP
```

---

## Troubleshooting:

If certificates fail to download:
```bash
# Check internet connectivity from container
docker exec traefik wget -O- https://github.com

# Manually download and check
docker exec traefik cat /etc/traefik/certs/fullchain.pem

# Restart Traefik to retry download
docker-compose restart traefik
```

If 502 Bad Gateway errors occur:
```bash
# Check if backend services are accessible
docker exec traefik wget -O- http://auth-service:5001
docker exec traefik wget -O- http://pms-service:5002

# Check Traefik network
docker network inspect wlan-network
```

---

## Additional Context:

This configuration uses:
- Traefik as HTTPS termination point
- Let's Encrypt certificates (pre-downloaded)
- Dynamic service discovery via Docker labels
- Centralized SSL management
- Automatic HTTP to HTTPS redirection
- Single entry point for all services

Perfect for microservices architecture with multiple backend services needing HTTPS access.
