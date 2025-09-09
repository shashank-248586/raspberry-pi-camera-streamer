document.addEventListener('DOMContentLoaded', function() {
    const videoFrame = document.getElementById('videoFrame');
    const connectionStatus = document.getElementById('connectionStatus');
    
    // Connect to the Socket.IO server
    const socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
        connectionStatus.textContent = 'Connected';
        connectionStatus.className = 'connected';
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.className = 'disconnected';
    });
    
    socket.on('video_frame', function(data) {
        // Update the image source with the new frame
        videoFrame.src = 'data:image/jpeg;base64,' + data.frame;
    });
    
    socket.on('connection_response', function(data) {
        console.log('Server:', data.data);
    });
});