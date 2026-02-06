# Server OC - Challenge Writeup

## Challenge Overview

**Name:** Server OC (Server Overclocking)  
**Category:** Web  
**Difficulty:** Medium  
**Points:** 500  

## Challenge Description

> Overclocking increases FPS, but for a SysAd, does it increase...Requests Per Second?
>
> https://server-oc.ctf.prgy.in/

## Initial Analysis

When we visit the challenge URL, we're presented with a web page that talks about "overclocking" a server. The page mentions:

1. The concept of overclocking in computing (pushing hardware beyond normal limits)
2. For servers, this means handling more requests per second
3. A target of **100 requests in 10 seconds**
4. Two API endpoints: `/api/stats` and `/api/flag`

## Understanding the Challenge

The challenge requires us to send a high volume of requests to the server within a specific timeframe. This simulates "overclocking" the server by pushing it to handle many requests per second.

### Key Information:
- Target: 100 requests within 10 seconds
- The server tracks requests per IP address
- Uses a sliding 10-second window
- Flag is revealed when threshold is met

## Solution Methods

### Method 1: Using Bash Script

The simplest approach is to use a bash loop to send multiple concurrent requests:

```bash
#!/bin/bash
CHALLENGE_URL="http://server-oc.ctf.prgy.in"

# Send 100+ concurrent requests
for i in {1..110}; do
    curl -s "${CHALLENGE_URL}/api/stats" > /dev/null &
done
wait

# Get the flag
curl "${CHALLENGE_URL}/api/flag"
```

### Method 2: Using Python with asyncio

For more control and better concurrency, use Python with async requests:

```python
import asyncio
import aiohttp
import requests

async def send_requests(url, count=100):
    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for _ in range(count)]
        await asyncio.gather(*tasks)

async def main():
    base_url = "http://server-oc.ctf.prgy.in"
    
    # Send concurrent requests
    await send_requests(f"{base_url}/api/stats", 110)
    
    # Get the flag
    response = requests.get(f"{base_url}/api/flag")
    print(response.json())

asyncio.run(main())
```

### Method 3: Using Apache Bench

If you have Apache Bench installed:

```bash
# Send 100 requests with 10 concurrent connections
ab -n 100 -c 10 http://server-oc.ctf.prgy.in/api/stats

# Get the flag
curl http://server-oc.ctf.prgy.in/api/flag
```

### Method 4: Using Python requests with threading

```python
import requests
from concurrent.futures import ThreadPoolExecutor

def make_request(url):
    requests.get(url)

def main():
    url = "http://server-oc.ctf.prgy.in"
    
    # Send 100 concurrent requests
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(make_request, f"{url}/api/stats") for _ in range(110)]
        for future in futures:
            future.result()
    
    # Get the flag
    response = requests.get(f"{url}/api/flag")
    print(response.json()['flag'])

if __name__ == "__main__":
    main()
```

## Step-by-Step Solution

1. **Visit the challenge page** to understand the requirements
2. **Check your stats** by visiting `/api/stats` to see current request count
3. **Send multiple concurrent requests** using any of the methods above
4. **Retrieve the flag** by visiting `/api/flag` immediately after sending the requests
5. **Verify success** by checking that you received the flag

## Expected Output

```json
{
  "success": true,
  "flag": "CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}",
  "message": "Congratulations! You've successfully overclocked the server!",
  "currentRPS": 110
}
```

## Flag

```
CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}
```

## Key Takeaways

1. **Rate Limiting**: Understanding how servers track and limit requests
2. **Concurrent Requests**: Learning to send multiple requests simultaneously
3. **Async Programming**: Using asynchronous I/O for efficient network operations
4. **Server Performance**: Understanding RPS (Requests Per Second) metrics
5. **API Interaction**: Working with REST APIs and interpreting responses

## Technical Details

The challenge uses:
- Express.js for the web server
- In-memory storage to track requests per IP
- A sliding 10-second window for request counting
- Automatic cleanup of old statistics

The server doesn't use traditional rate limiting that blocks requests; instead, it tracks them and rewards high request rates, making it a "reverse" rate limiting challenge.

## Common Issues

1. **Requests too slow**: If using sequential requests instead of concurrent
2. **Timeout**: If the 10-second window expires before retrieving the flag
3. **Not enough requests**: If sending fewer than 100 requests

## Related Concepts

- Load testing
- DDoS (for educational purposes only)
- Server scalability
- Concurrent programming
- Async I/O

## Tools Used

- `curl` - Command line HTTP client
- `Python` with `aiohttp` - Async HTTP library
- `Apache Bench` - HTTP load testing tool
- `ThreadPoolExecutor` - Python threading library

---

*Challenge created for CTF competition to teach concepts of server performance and concurrent request handling.*
