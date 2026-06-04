const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.redirect('/controller'));
app.get('/controller', (req, res) => res.sendFile(path.join(__dirname, 'public/controller/index.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public/overlay/index.html')));

// State
let currentState = {
  visible: false,
  theme: 'broadcast',
  animIn: 'slide-left',
  animOut: 'slide-right',
  data: {
    title: '',
    subtitle: '',
    tag: '',
    logo: '',
    ticker: '',
    showTicker: false,
    accent: '#e63946'
  }
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state to newly connected overlay
  socket.emit('state', currentState);

  // Controller sends show command
  socket.on('show', (payload) => {
    currentState = { ...currentState, ...payload, visible: true };
    io.emit('show', currentState);
    console.log('SHOW:', currentState.data.title);
  });

  // Controller sends hide command
  socket.on('hide', () => {
    currentState.visible = false;
    io.emit('hide', { animOut: currentState.animOut });
    console.log('HIDE');
  });

  // Controller updates without showing
  socket.on('update', (payload) => {
    currentState = { ...currentState, ...payload };
    io.emit('update', currentState);
  });

  // Ticker update
  socket.on('ticker', (text) => {
    currentState.data.ticker = text;
    io.emit('ticker', text);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎬 Lower Third Server running`);
  console.log(`   Controller : http://localhost:${PORT}/controller`);
  console.log(`   Overlay    : http://localhost:${PORT}/overlay`);
  console.log(`   OBS URL    : http://<IP-KOMPUTER>:${PORT}/overlay\n`);
});
