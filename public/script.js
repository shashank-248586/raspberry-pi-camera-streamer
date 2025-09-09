class CameraStream {
    constructor() {
        this.ws = null;
        this.isStreaming = false;
        this.capturedImages = [];
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.cameraFeed = document.getElementById('cameraFeed');
        this.status = document.getElementById('status');
        this.toggleBtn = document.getElementById('toggleStream');
        this.captureBtn = document.getElementById('captureImage');
        this.qualitySelect = document.getElementById('quality');
        this.imagesContainer = document.querySelector('.images-container');
    }
    
    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggleStream());
        this.captureBtn.addEventListener('click', () => this.captureImage());
        this.qualitySelect.addEventListener('change', () => this.changeQuality());
    }
    
    toggleStream() {
        if (this.isStreaming) {
            this.stopStream();
        } else {
            this.startStream();
        }
    }
    
    startStream() {
        this.updateStatus('Connecting...', 'connecting');
        
        // Create WebSocket connection (use wss:// for secure connection in production)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            this.isStreaming = true;
            this.toggleBtn.textContent = 'Stop Stream';
            this.updateStatus('Connected', 'connected');
            console.log('WebSocket connection established');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.displayFrame(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Connection Error', 'error');
        };
        
        this.ws.onclose = () => {
            if (this.isStreaming) {
                this.updateStatus('Disconnected', 'error');
                console.log('WebSocket connection closed');
                // Try to reconnect after 3 seconds
                setTimeout(() => this.startStream(), 3000);
            }
        };
    }
    
    stopStream() {
        this.isStreaming = false;
        this.toggleBtn.textContent = 'Start Stream';
        this.updateStatus('Disconnected', 'error');
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    displayFrame(data) {
        // Update the image source with the frame data
        this.cameraFeed.src = data.image;
    }
    
    captureImage() {
        if (!this.isStreaming) {
            alert('Please start the stream first');
            return;
        }
        
        // Create a new image from the current video feed
        const image = new Image();
        image.src = this.cameraFeed.src;
        
        // Add to captured images array
        this.capturedImages.push(image.src);
        
        // Update the UI
        this.updateCapturedImages();
    }
    
    updateCapturedImages() {
        // Clear the container
        this.imagesContainer.innerHTML = '';
        
        // Add all captured images
        this.capturedImages.forEach((src, index) => {
            const div = document.createElement('div');
            div.className = 'captured-image';
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Captured image ${index + 1}`;
            
            div.appendChild(img);
            this.imagesContainer.appendChild(div);
        });
    }
    
    changeQuality() {
        if (!this.isStreaming) return;
        
        const quality = this.qualitySelect.value;
        // In a real implementation, you would send a message to the server
        // to adjust the stream quality
        console.log(`Quality changed to: ${quality}`);
        
        // For demonstration purposes
        alert(`Stream quality set to ${quality}. In a real implementation, this would adjust the actual stream.`);
    }
    
    updateStatus(message, className) {
        this.status.textContent = message;
        this.status.className = className || '';
    }
}

// Initialize the camera stream when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const stream = new CameraStream();
});