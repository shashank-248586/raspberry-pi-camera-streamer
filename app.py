from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import base64
from gevent import monkey
monkey.patch_all()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, async_mode='gevent', cors_allowed_origins="*")

# Store connected clients
clients = []

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    clients.append(request.sid)
    print(f'Client connected: {request.sid}')
    emit('connection_response', {'data': 'Connected successfully'})

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in clients:
        clients.remove(request.sid)
    print(f'Client disconnected: {request.sid}')

@socketio.on('video_frame')
def handle_video_frame(data):
    # Broadcast the frame to all connected clients except the sender
    emit('video_frame', data, broadcast=True, include_self=False)
    print(f"Frame received from {request.sid} and broadcasted")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
