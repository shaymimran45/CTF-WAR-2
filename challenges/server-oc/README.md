# Server OC - CTF Challenge

**Category:** Web  
**Difficulty:** Medium  
**Points:** 500  

## Description

Overclocking increases FPS in gaming, but for a SysAd, does it increase...Requests Per Second?

Can you push this server beyond its normal limits and make it reveal the flag?

## Challenge URL

https://server-oc.ctf.prgy.in/

## Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

The challenge will be available at `http://localhost:3000`

### Using Docker

```bash
# Build the image
docker build -t server-oc .

# Run the container
docker run -d -p 3000:3000 -e FLAG="CTF{your_custom_flag}" server-oc
```

### Using Node.js

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `FLAG`: The flag to reveal (default: CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr})
- `NODE_ENV`: Environment (production/development)

## How It Works

1. The server tracks requests per IP address
2. It maintains a rolling window of the last 10 seconds
3. Players need to send at least 100 requests within a 10-second window
4. Once the threshold is reached, the `/api/flag` endpoint reveals the flag

## API Endpoints

- `GET /` - Main challenge page with UI
- `GET /api/stats` - Check your current request statistics
- `GET /api/flag` - Get the flag (requires 100 requests in 10 seconds)
- `GET /health` - Health check endpoint

## Solution Approach

Players need to send multiple requests quickly to "overclock" the server. This can be done using:

1. **Shell scripting:**
```bash
for i in {1..100}; do curl http://server-oc.ctf.prgy.in/api/stats & done; wait
curl http://server-oc.ctf.prgy.in/api/flag
```

2. **Python script:**
```python
import requests
import asyncio
import aiohttp

async def make_request(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    url = "http://server-oc.ctf.prgy.in/api/stats"
    async with aiohttp.ClientSession() as session:
        tasks = [make_request(session, url) for _ in range(100)]
        await asyncio.gather(*tasks)
    
    # Now get the flag
    response = requests.get("http://server-oc.ctf.prgy.in/api/flag")
    print(response.json())

asyncio.run(main())
```

3. **Using a load testing tool:**
```bash
# Using Apache Bench
ab -n 100 -c 10 http://server-oc.ctf.prgy.in/api/stats

# Then get the flag
curl http://server-oc.ctf.prgy.in/api/flag
```

## Learning Objectives

- Understanding rate limiting and request handling
- Learning about server performance and RPS (Requests Per Second)
- Practicing with concurrent requests and async programming
- Exploring API interactions and server behavior

## Flag Format

`CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}`

## Notes

- The server uses a 10-second sliding window for request counting
- Stats are cleaned up periodically to prevent memory issues
- Each IP address is tracked independently
- The challenge simulates the concept of "overclocking" in a server context

## Author

CTF Team

## License

MIT
