# CTF Challenge: Server OC (Server Overclocking)

## Overview

This directory contains the complete implementation of the "Server OC" CTF challenge - a web-based challenge that teaches concepts around request rate management, concurrent programming, and server performance testing.

## Challenge Summary

**Challenge Name:** Server OC  
**Category:** Web Security  
**Difficulty:** Medium (500 points)  
**Concept:** Reverse rate limiting - players must send high volumes of requests to "overclock" the server and reveal the flag  
**Flag:** `CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}`  

## Quick Links

- **[README.md](README.md)** - Complete challenge documentation and deployment instructions
- **[WRITEUP.md](WRITEUP.md)** - Detailed solution walkthrough with multiple approaches
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Quick deployment guide for CTF organizers
- **[CHALLENGE_INFO.md](CHALLENGE_INFO.md)** - Comprehensive challenge information for organizers

## What's Included

```
server-oc/
├── src/
│   └── server.js          # Main Express.js server application
├── Dockerfile             # Container image definition
├── docker-compose.yml     # Easy deployment configuration
├── package.json           # Node.js dependencies
├── solution.sh            # Bash solution script
├── solution.py            # Python solution script
├── README.md              # Main documentation
├── WRITEUP.md             # Solution guide
├── DEPLOYMENT.md          # Deployment guide
└── CHALLENGE_INFO.md      # Challenge design info
```

## Quick Start (For Testing)

```bash
# 1. Navigate to the challenge directory
cd challenges/server-oc

# 2. Start with Docker Compose
docker-compose up -d

# 3. Test the challenge
./solution.sh http://localhost:3000
```

## How It Works

The challenge requires players to:

1. **Understand the concept:** The server tracks requests per IP address
2. **Meet the threshold:** Send 100 requests within a 10-second window
3. **Retrieve the flag:** Call `/api/flag` after meeting the threshold
4. **Success:** Receive the flag `CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}`

## Learning Objectives

Players will learn:
- ✅ Understanding request rate concepts (RPS - Requests Per Second)
- ✅ Writing concurrent/asynchronous code
- ✅ Using HTTP tools and libraries effectively
- ✅ Server performance testing concepts
- ✅ Creative problem solving with rate limiting

## Solution Methods

Players can solve this using various approaches:

1. **Bash loops with background jobs** - Simplest approach
2. **Python with asyncio** - More control and elegant
3. **Load testing tools** (Apache Bench, wrk, etc.) - Professional approach
4. **Any HTTP library with concurrency support**

## Deployment Options

### Development
```bash
npm install
npm start
```

### Production (Docker Compose - Recommended)
```bash
docker-compose up -d
```

### Production (Kubernetes)
See CHALLENGE_INFO.md for Kubernetes manifests

## Customization

### Change the Flag
```bash
# In docker-compose.yml
environment:
  - FLAG=CTF{your_custom_flag}
```

### Adjust Difficulty
Edit `src/server.js` to modify:
- Required requests (default: 100)
- Time window (default: 10 seconds)

## Testing

Both solution scripts are provided and tested:

```bash
# Test with Bash
./solution.sh http://localhost:3000

# Test with Python (requires aiohttp)
pip3 install aiohttp requests
python3 solution.py http://localhost:3000
```

## Resource Requirements

- **CPU:** 0.5 cores minimum
- **Memory:** 128MB minimum, 256MB recommended  
- **Ports:** 3000 (configurable)
- **Expected Solves:** 40-60% of teams

## Technical Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Dependencies:** express, express-rate-limit
- **Container:** Alpine Linux-based Docker image

## Security Notes

⚠️ **Important:** This challenge encourages high request rates for educational purposes. When deploying:

1. Use resource limits on containers
2. Deploy behind a reverse proxy
3. Monitor resource usage during events
4. Consider implementing maximum request limits per IP

## CTF Platform Integration

The challenge can be easily integrated into popular CTF platforms:

```json
{
  "title": "Server OC",
  "category": "Web",
  "difficulty": "Medium",
  "points": 500,
  "flag": "CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}",
  "connection": "http://server-oc.ctf.prgy.in/"
}
```

## Support and Documentation

- Full deployment instructions in [DEPLOYMENT.md](DEPLOYMENT.md)
- Complete solution guide in [WRITEUP.md](WRITEUP.md)
- Challenge design details in [CHALLENGE_INFO.md](CHALLENGE_INFO.md)
- API documentation on the challenge web UI

## Author

Created for CTF competitions to teach web security concepts, concurrent programming, and server performance testing.

## License

MIT License - Free to use and modify for educational CTF events.

---

**Ready to Deploy?** Start with `docker-compose up -d` and visit http://localhost:3000
