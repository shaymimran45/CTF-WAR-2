# Server OC Challenge - Challenge Information

## Quick Summary

**Name:** Server OC (Server Overclocking)  
**Category:** Web Security  
**Difficulty:** Medium  
**Points:** 500  
**Flag:** `CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}`

## Challenge Concept

This challenge is a creative twist on traditional rate-limiting challenges. Instead of preventing users from making too many requests, it **requires** users to make a high volume of requests to "overclock" the server and reveal the flag.

The challenge teaches:
- Understanding of request rate management
- Concurrent/asynchronous programming
- Server performance concepts (RPS - Requests Per Second)
- Using various HTTP tools and libraries

## How It Works

1. **Request Tracking:** The server tracks requests per IP address using an in-memory store
2. **Sliding Window:** It maintains a 10-second sliding window of recent requests
3. **Threshold:** Players must achieve **100 requests within 10 seconds**
4. **Reward:** Once the threshold is met, the `/api/flag` endpoint reveals the flag

## Challenge Components

### Web Server (`src/server.js`)
- Express.js application
- Tracks request statistics per IP
- Provides a user-friendly web UI
- Exposes API endpoints for stats and flag retrieval

### API Endpoints
- `GET /` - Main challenge page with instructions
- `GET /api/stats` - Check current request statistics
- `GET /api/flag` - Retrieve the flag (requires 100 RPS)
- `GET /health` - Health check for monitoring

### Solution Scripts
- **solution.sh** - Bash script using curl loops
- **solution.py** - Python script with async requests

## Deployment Options

### Option 1: Docker Compose (Recommended for CTF)
```bash
cd challenges/server-oc
docker-compose up -d
```

### Option 2: Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-oc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: server-oc
  template:
    metadata:
      labels:
        app: server-oc
    spec:
      containers:
      - name: server-oc
        image: your-registry/server-oc:latest
        ports:
        - containerPort: 3000
        env:
        - name: FLAG
          value: "CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}"
---
apiVersion: v1
kind: Service
metadata:
  name: server-oc
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: server-oc
```

### Option 3: Node.js Direct
```bash
cd challenges/server-oc
npm install
PORT=3000 FLAG="CTF{custom_flag}" npm start
```

## Customization

### Change the Flag
Set the `FLAG` environment variable:
```bash
export FLAG="CTF{your_custom_flag_here}"
```

Or in docker-compose.yml:
```yaml
environment:
  - FLAG=CTF{your_custom_flag_here}
```

### Adjust Difficulty
Edit `src/server.js` to modify:
- Required requests (default: 100)
- Time window (default: 10 seconds)
- Statistics cleanup interval

Example:
```javascript
// Make it easier (50 requests in 10 seconds)
if (stats.requests.length >= 50) {
  res.json({ success: true, flag: FLAG, ... });
}

// Make it harder (200 requests in 5 seconds)
stats.requests = stats.requests.filter(time => now - time < 5000);
if (stats.requests.length >= 200) {
  res.json({ success: true, flag: FLAG, ... });
}
```

## Expected Player Journey

1. **Discovery Phase**
   - Visit the challenge URL
   - Read the description about "overclocking"
   - Explore the web UI and API endpoints

2. **Analysis Phase**
   - Check `/api/stats` to understand requirements
   - Realize they need to send many requests quickly
   - Plan their approach (bash, python, load testing tool)

3. **Exploitation Phase**
   - Write or use a script to send concurrent requests
   - Monitor stats to ensure threshold is met
   - Retrieve the flag from `/api/flag`

4. **Success**
   - Flag is revealed: `CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}`

## Common Solution Approaches

### Bash Loop with Background Jobs
```bash
for i in {1..110}; do 
  curl -s http://server-oc.ctf.prgy.in/api/stats &
done
wait
curl http://server-oc.ctf.prgy.in/api/flag
```

### Python with asyncio
```python
import asyncio
import aiohttp

async def send_requests():
    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for _ in range(110)]
        await asyncio.gather(*tasks)
```

### Apache Bench
```bash
ab -n 100 -c 10 http://server-oc.ctf.prgy.in/api/stats
curl http://server-oc.ctf.prgy.in/api/flag
```

### Python with Threading
```python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(make_request, url) for _ in range(110)]
```

## Security Considerations

### For CTF Organizers
1. **Resource Limits:** Set appropriate container resource limits
2. **Rate Limiting:** Consider implementing a per-IP maximum to prevent abuse
3. **Monitoring:** Monitor server load and response times
4. **Isolation:** Run in isolated environment to prevent DoS on infrastructure

### Not a Real Security Vulnerability
This challenge is educational and demonstrates **reverse rate limiting**. It's not exploiting a real vulnerability but teaching concepts around:
- Request handling
- Concurrent programming
- Server performance testing

## Monitoring and Troubleshooting

### Check Server Health
```bash
curl http://server-oc.ctf.prgy.in/health
```

### View Logs
```bash
docker-compose logs -f server-oc
```

### Common Issues
1. **Challenge not responding:** Check Docker container status
2. **Flag not revealed:** Ensure 100 requests are sent within 10 seconds
3. **High server load:** Adjust resource limits or implement rate limiting

## Educational Value

This challenge teaches:
- **Web Development:** Understanding HTTP requests and API design
- **Performance Testing:** Learning about RPS and server load
- **Concurrent Programming:** Writing async/parallel code
- **Tool Usage:** Using curl, Python, load testing tools
- **Problem Solving:** Thinking creatively about rate concepts

## Scoring and Hints

### Base Points: 500

### Hints (Optional)
1. **(Free)** "Think about how to send many requests at once, not one at a time"
2. **(50 pts penalty)** "Use bash loops with & for background jobs, or Python's asyncio"
3. **(100 pts penalty)** "Run: for i in {1..110}; do curl http://url/api/stats & done"

## Statistics

Expected metrics for this challenge:
- **Solve Time:** 15-45 minutes (medium difficulty)
- **Solve Rate:** 40-60% of teams (medium popularity)
- **Common Mistakes:** 
  - Sending requests sequentially instead of concurrently
  - Not understanding the 10-second window
  - Forgetting to retrieve the flag after overclocking

## Integration with CTF Platform

### Challenge Entry
```json
{
  "title": "Server OC",
  "description": "Overclocking increases FPS, but for a SysAd, does it increase...Requests Per Second?\n\nhttp://server-oc.ctf.prgy.in/",
  "category": "Web",
  "difficulty": "Medium",
  "points": 500,
  "flag": "CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}",
  "files": [],
  "connection_info": "http://server-oc.ctf.prgy.in/"
}
```

## Credits

**Author:** CTF Team  
**Testing:** Verified with multiple solution methods  
**License:** MIT  

---

For deployment assistance or questions, refer to the README.md in the challenge directory.
