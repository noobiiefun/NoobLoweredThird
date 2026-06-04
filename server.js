const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/controller'));
app.get('/controller', (req, res) => res.sendFile(path.join(__dirname, 'public/controller/index.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public/overlay/index.html')));

// ─── STATE ───
let currentState = {
  visible: false,
  theme: 'broadcast',
  animIn: 'slide-left',
  animOut: 'slide-right',
  sceneId: null,        // active scene id
  data: {
    title: '',
    subtitle: '',
    tag: '',
    logoUrl: '',
    ticker: '',
    showTicker: false,
    accent: '#e63946',
    autoHide: 0,        // seconds, 0 = disabled
    countdown: 0,       // seconds, 0 = disabled
    countdownLabel: 'DIMULAI DALAM',
  }
};

// Scene library: { id, name, theme, animIn, animOut, data }
let scenes = [];
let nextSceneId = 1;

// Auto-hide timer handle
let autoHideTimer = null;

function clearAutoHide() {
  if (autoHideTimer) { clearTimeout(autoHideTimer); autoHideTimer = null; }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('state', currentState);
  socket.emit('scenes', scenes);

  // SHOW
  socket.on('show', (payload) => {
    clearAutoHide();
    currentState = { ...currentState, ...payload, visible: true };
    io.emit('show', currentState);
    console.log('SHOW:', currentState.data?.title);

    const sec = Number(currentState.data?.autoHide || 0);
    if (sec > 0) {
      autoHideTimer = setTimeout(() => {
        currentState.visible = false;
        io.emit('hide', { animOut: currentState.animOut });
        io.emit('autoHidden', {});
        console.log('AUTO-HIDE after', sec, 's');
      }, sec * 1000);
    }
  });

  // HIDE
  socket.on('hide', () => {
    clearAutoHide();
    currentState.visible = false;
    io.emit('hide', { animOut: currentState.animOut });
    console.log('HIDE');
  });

  // UPDATE (style/settings without showing)
  socket.on('update', (payload) => {
    currentState = { ...currentState, ...payload };
    io.emit('update', currentState);
  });

  // TICKER
  socket.on('ticker', (text) => {
    currentState.data.ticker = text;
    io.emit('ticker', text);
  });

  // ─── SCENES ───
  socket.on('scene:save', (scene) => {
    if (scene.id) {
      // update existing
      const idx = scenes.findIndex(s => s.id === scene.id);
      if (idx >= 0) scenes[idx] = scene;
    } else {
      scene.id = nextSceneId++;
      scenes.push(scene);
    }
    io.emit('scenes', scenes);
    console.log('Scene saved:', scene.name);
  });

  socket.on('scene:delete', (id) => {
    scenes = scenes.filter(s => s.id !== id);
    io.emit('scenes', scenes);
  });

  socket.on('scene:load', (id) => {
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      currentState = { ...currentState, ...scene, sceneId: id, visible: true };
      clearAutoHide();
      io.emit('show', currentState);
      const sec = Number(currentState.data?.autoHide || 0);
      if (sec > 0) {
        autoHideTimer = setTimeout(() => {
          currentState.visible = false;
          io.emit('hide', { animOut: currentState.animOut });
          io.emit('autoHidden', {});
        }, sec * 1000);
      }
    }
  });

  // ─── COUNTDOWN ───
  socket.on('countdown:start', (payload) => {
    clearAutoHide();
    currentState = { ...currentState, ...payload, visible: true };
    io.emit('countdown:start', currentState);
    console.log('COUNTDOWN:', currentState.data?.countdown, 's');
  });

  socket.on('countdown:stop', () => {
    io.emit('countdown:stop');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎬 NOOB Lower Third v2.0`);
  console.log(`   Controller : http://localhost:${PORT}/controller`);
  console.log(`   Overlay    : http://localhost:${PORT}/overlay`);
  console.log(`   OBS URL    : http://<IP-LAN>:${PORT}/overlay\n`);
});
