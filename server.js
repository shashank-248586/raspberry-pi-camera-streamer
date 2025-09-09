const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected clients (browsers)
const browsers = new Set();
// Store the Raspberry Pi connection
let raspberryPiConnection = null;

wss.on('connection', function connection(ws) {
  console.log('New connection established');

  // When a message is received from a client
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      // If the client identifies itself as the Raspberry Pi
      if (data.type === 'raspberry-pi') {
        console.log('Raspberry Pi connected');
        raspberryPiConnection = ws;
        // Remove the Raspberry Pi from browsers set
        browsers.delete(ws);
        
        // Handle Raspberry Pi connection close
        ws.on('close', () => {
          console.log('Raspberry Pi disconnected');
          raspberryPiConnection = null;
        });
      }
    } catch (error) {
      // Assume it's a browser client
      // (In this example, browsers don't send messages, so we don't handle them)
    }
  });

  // Assume it's a browser client by default
  browsers.add(ws);

  // Handle browser client disconnection
  ws.on('close', () => {
    browsers.delete(ws);
    console.log('Browser disconnected');
  });
});

// Function to broadcast data to all browsers
function broadcastToBrowsers(data) {
  browsers.forEach((browser) => {
    if (browser.readyState === WebSocket.OPEN) {
      browser.send(data);
    }
  });
}

// If we receive a message from the Raspberry Pi, broadcast it to all browsers
// We'll set up a listener for the Raspberry Pi connection separately because we set raspberryPiConnection
// Alternatively, we can handle it in the 'message' event of the Raspberry Pi connection.
// We can modify the 'message' event for the Raspberry Pi connection to broadcast the message.

// But note: we already set the Raspberry Pi connection. We can set the message handler for it when we identify it.

// Alternatively, we can check in the general message handler if the ws is the Raspberry Pi connection.

// Let's change the connection handler to set the message event for the Raspberry Pi:

// Actually, we can do it in the 'message' event when we identify the Raspberry Pi.

// Revised 'message' event:

// wss.on('connection', function connection(ws) {
//   console.log('New connection established');
// 
//   ws.on('message', function incoming(message) {
//     try {
//       const data = JSON.parse(message);
//       if (data.type === 'raspberry-pi') {
//         console.log('Raspberry Pi connected');
//         raspberryPiConnection = ws;
//         browsers.delete(ws);
// 
//         // Set up message handler for Raspberry Pi
//         ws.on('message', function piMessage(frameData) {
//           // Broadcast the frame data to all browsers
//           broadcastToBrowsers(frameData);
//         });
// 
//         ws.on('close', () => {
//           console.log('Raspberry Pi disconnected');
//           raspberryPiConnection = null;
//         });
//       }
//     } catch (error) {
//       // Not a JSON message, so ignore (browsers don't send messages in this example)
//     }
//   });
// 
//   // Assume it's a browser
//   browsers.add(ws);
//   ws.on('close', () => {
//     browsers.delete(ws);
//   });
// });

// However, the above approach would overwrite the message handler for the Raspberry Pi.

// Alternatively, we can do:

wss.on('connection', function connection(ws) {
  console.log('New connection established');

  // Default: treat as browser
  browsers.add(ws);

  ws.on('message', function incoming(message) {
    // Check if the message is from Raspberry Pi (identifying itself)
    if (message.toString() === 'raspberry-pi') {
      console.log('Raspberry Pi connected');
      raspberryPiConnection = ws;
      // Remove from browsers set
      browsers.delete(ws);

      // Now, change the message handler for the Raspberry Pi to broadcast frames
      ws.removeAllListeners('message');
      ws.on('message', function piMessage(frameData) {
        // Broadcast the frame data to all browsers
        broadcastToBrowsers(frameData.toString());
      });

      ws.on('close', () => {
        console.log('Raspberry Pi disconnected');
        raspberryPiConnection = null;
      });

      return;
    }

    // Otherwise, it's a message from a browser (if any)
    // In this example, we don't expect messages from browsers, so we ignore.
  });

  ws.on('close', () => {
    if (browsers.has(ws)) {
      browsers.delete(ws);
      console.log('Browser disconnected');
    } else if (ws === raspberryPiConnection) {
      raspberryPiConnection = null;
      console.log('Raspberry Pi disconnected');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
