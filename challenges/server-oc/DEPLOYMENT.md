# Quick Deployment Guide - Server OC Challenge

## Prerequisites
- Docker and Docker Compose installed
- Port 3000 available (or configure a different port)

## Quick Start

### 1. Build and Run with Docker Compose
```bash
cd challenges/server-oc
docker-compose up -d
```

The challenge will be available at `http://localhost:3000`

### 2. Verify Deployment
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","uptime":X.XXX}
```

### 3. Test the Challenge
```bash
# Send multiple requests
for i in {1..110}; do curl -s http://localhost:3000/api/stats > /dev/null & done
wait

# Get the flag
curl http://localhost:3000/api/flag
```

## Production Deployment

### Using Custom Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Changed from 3000:3000
```

### Using Custom Flag
Edit `docker-compose.yml`:
```yaml
environment:
  - FLAG=CTF{your_custom_flag_here}
```

### Using Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name server-oc.ctf.prgy.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Stopping the Challenge
```bash
docker-compose down
```

## Updating the Challenge
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Container not starting
```bash
# Check logs
docker-compose logs server-oc

# Check if port is in use
netstat -tlnp | grep 3000
```

### Challenge not responding
```bash
# Restart the service
docker-compose restart

# Check container status
docker-compose ps
```

### High memory usage
```bash
# Add resource limits in docker-compose.yml
services:
  server-oc:
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

## Resource Requirements

- **CPU:** 0.5 cores minimum
- **Memory:** 128MB minimum, 256MB recommended
- **Disk:** ~50MB for image
- **Network:** Standard HTTP traffic

## Security Notes

1. **Do not expose to public internet without rate limiting** - The challenge encourages high request rates
2. **Use a reverse proxy** for production deployments
3. **Monitor resource usage** during CTF events
4. **Set container resource limits** to prevent resource exhaustion

## URLs to Share

- Main Challenge: `http://your-domain.com/` or `http://server-oc.ctf.prgy.in/`
- API Documentation: Available on the main page

## Support

For issues or questions, refer to:
- README.md - Detailed documentation
- WRITEUP.md - Solution explanations
- CHALLENGE_INFO.md - Challenge design details
