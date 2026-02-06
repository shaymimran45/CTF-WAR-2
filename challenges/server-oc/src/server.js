const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Store request statistics per IP
const requestStats = new Map();

// The flag
const FLAG = process.env.FLAG || 'CTF{0v3rcl0ck3d_s3rv3r_g03s_brrr}';

// Middleware to track requests
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestStats.has(ip)) {
    requestStats.set(ip, {
      requests: [],
      totalRequests: 0
    });
  }
  
  const stats = requestStats.get(ip);
  stats.requests.push(now);
  stats.totalRequests++;
  
  // Keep only requests from the last 10 seconds
  stats.requests = stats.requests.filter(time => now - time < 10000);
  
  next();
});

app.use(express.json());
app.use(express.static('public'));

// Main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Server OC - Overclocking Challenge</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: rgba(0, 0, 0, 0.7);
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 600px;
        }
        h1 {
          color: #00ff00;
          text-shadow: 0 0 10px #00ff00;
          margin-bottom: 20px;
        }
        .stats {
          background: rgba(0, 255, 0, 0.1);
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border: 1px solid #00ff00;
        }
        .hint {
          color: #ffaa00;
          font-style: italic;
          margin-top: 20px;
        }
        code {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }
        button {
          background: #00ff00;
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin: 10px 5px;
        }
        button:hover {
          background: #00cc00;
        }
        #result {
          margin-top: 20px;
          padding: 10px;
          border-radius: 5px;
          display: none;
        }
        .success {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid #00ff00;
        }
        .error {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚡ Server OC Challenge ⚡</h1>
        <p>Welcome to the Server Overclocking challenge!</p>
        <p>Just like overclocking increases FPS in gaming, can you "overclock" this server?</p>
        
        <div class="stats">
          <h3>📊 Server Stats</h3>
          <p>Check your current performance: <button onclick="checkStats()">Check Stats</button></p>
          <p>Try to get the flag: <button onclick="getFlag()">Get Flag</button></p>
          <div id="result"></div>
        </div>
        
        <div class="hint">
          💡 Hint: In computing, overclocking means pushing hardware beyond its normal limits. 
          For servers, this means handling more requests per second than usual. 
          Can you achieve <strong>100 requests in 10 seconds</strong>?
        </div>
        
        <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
          Use the API endpoints: <code>/api/stats</code> and <code>/api/flag</code>
        </p>
      </div>
      
      <script>
        async function checkStats() {
          try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            const result = document.getElementById('result');
            result.style.display = 'block';
            result.className = 'success';
            result.innerHTML = \`
              <h4>Current Performance:</h4>
              <p>Requests in last 10s: <strong>\${data.recentRequests}</strong></p>
              <p>Total requests: <strong>\${data.totalRequests}</strong></p>
              <p>Required RPS: <strong>100 requests / 10 seconds</strong></p>
              <p>Status: \${data.recentRequests >= 100 ? '✅ OVERCLOCKED!' : '❌ Not enough'}</p>
            \`;
          } catch (error) {
            console.error('Error:', error);
          }
        }
        
        async function getFlag() {
          try {
            const response = await fetch('/api/flag');
            const data = await response.json();
            const result = document.getElementById('result');
            result.style.display = 'block';
            
            if (data.flag) {
              result.className = 'success';
              result.innerHTML = \`
                <h4>🎉 Congratulations! 🎉</h4>
                <p>You've successfully overclocked the server!</p>
                <p style="font-size: 1.2em; font-weight: bold; color: #00ff00;">\${data.flag}</p>
              \`;
            } else {
              result.className = 'error';
              result.innerHTML = \`
                <h4>⚠️ Not Enough Power</h4>
                <p>\${data.message}</p>
                <p>Current RPS: \${data.currentRPS}</p>
                <p>Required: 100 requests / 10 seconds</p>
              \`;
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint to check stats
app.get('/api/stats', (req, res) => {
  const ip = req.ip;
  const stats = requestStats.get(ip) || { requests: [], totalRequests: 0 };
  
  res.json({
    recentRequests: stats.requests.length,
    totalRequests: stats.totalRequests,
    requiredRPS: 100,
    timeWindow: '10 seconds'
  });
});

// API endpoint to get flag (requires high RPS)
app.get('/api/flag', (req, res) => {
  const ip = req.ip;
  const stats = requestStats.get(ip) || { requests: [], totalRequests: 0 };
  
  // Check if user has made enough requests in the last 10 seconds
  if (stats.requests.length >= 100) {
    res.json({
      success: true,
      flag: FLAG,
      message: 'Congratulations! You\'ve successfully overclocked the server!',
      currentRPS: stats.requests.length
    });
  } else {
    res.json({
      success: false,
      message: 'Server not overclocked enough! You need to send 100 requests within 10 seconds.',
      currentRPS: stats.requests.length,
      required: 100
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Clean up old stats every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, stats] of requestStats.entries()) {
    // Remove IPs that haven't made requests in the last 5 minutes
    if (stats.requests.length === 0 || now - stats.requests[stats.requests.length - 1] > 300000) {
      requestStats.delete(ip);
    }
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`Server OC Challenge running on port ${PORT}`);
  console.log(`Flag: ${FLAG}`);
});
