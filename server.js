const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Raspberry Pi camera stream URL (you'll need to update this)
const RASPBERRY_PI_STREAM_URL = 'http://your-raspberry-pi-ip:port/stream';

// Store connected clients
let clients = [];

// WebSocket connection handling
wss.on('connection', function connection(ws) {
  console.log('New client connected');
  clients.push(ws);
  
  ws.on('close', function() {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

// Function to fetch camera frame and broadcast to clients
async function broadcastCameraFrame() {
  try {
    // In a real implementation, you would fetch the frame from your Raspberry Pi
    // For demonstration, we're using a placeholder
    
    // Simulate frame data (replace with actual frame fetching logic)
    const frameData = {
      timestamp: Date.now(),
      // In a real implementation, this would be image data
      image: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="white">Raspberry Pi Camera Frame - ${Date.now()}</text></svg>`).toString('base64')}`
    };
    
    // Broadcast to all connected clients
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(frameData));
      }
    });
  } catch (error) {
    console.error('Error fetching camera frame:', error);
  }
}

// Broadcast frames at intervals (simulating real-time stream)
setInterval(broadcastCameraFrame, 100); // ~10 FPS

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});