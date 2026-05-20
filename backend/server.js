const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); // ⭐ NEU
const { Server } = require('socket.io'); // ⭐ NEU
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddlware');

// Routes
const uebungenRoutes = require('./routes/uebungenRoutes');
const nutzerRoutes = require('./routes/nutzerRoutes');
const trainingsplanRoutes = require('./routes/trainingsplanRoutes');
const nutzerTrainingsplanRoutes = require('./routes/nutzerTrainingsplanRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const gruppenRoutes = require('./routes/gruppenRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const customTrainingsPlanRoutes = require('./routes/customTrainingsplanRoutes');
const nutzerController = require('./controllers/nutzerController');
const gewichtRoutes = require('./routes/gewichtRoutes');
const adminRoutes = require('./routes/adminRoutes');
const espRoutes = require('./routes/espRoutes');

const app = express();
const server = http.createServer(app); // ⭐ NEU: HTTP-Server erstellen
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.NODE_ENV === 'production'
? ['https://akkkker.de', 'https://www.akkkker.de']
: ['http://localhost:3000', 'http://localhost:3001'];

// ⭐ NEU: Socket.io konfigurieren
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// ⭐ NEU: Socket.io globally verfügbar machen
app.set('io', io);

app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Origin blockiert:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Öffentliche Routes (OHNE authMiddleware)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server läuft' });
});

app.post('/api/nutzer/login', nutzerController.login);
app.post('/api/nutzer/register', nutzerController.createNutzer);
app.post('/api/nutzer/forgot-password', nutzerController.forgotPassword);
app.post('/api/nutzer/reset-password', nutzerController.resetPassword);

app.get('/api/nutzer/validate-session', authMiddleware, nutzerController.validateSession);
app.post('/api/nutzer/logout', nutzerController.logout);

// Geschützte Routes (mit authMiddleware)
app.use('/api/nutzer', authMiddleware, nutzerRoutes);
app.use('/api/uebungen', authMiddleware, uebungenRoutes);
app.use('/api/trainingsplaene', authMiddleware, trainingsplanRoutes);
app.use('/api/nutzer-trainingsplan', authMiddleware, nutzerTrainingsplanRoutes);
app.use('/api/training', authMiddleware, trainingRoutes);
app.use('/api/gruppen', authMiddleware, gruppenRoutes);
app.use('/api/feedback', authMiddleware, feedbackRoutes);
app.use('/api/custom-trainingsplan', authMiddleware, customTrainingsPlanRoutes);
app.use('/api/gewicht', authMiddleware, gewichtRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/esp', authMiddleware, espRoutes);

// ⭐ NEU: Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] ✅ Client verbunden: ${socket.id}`);

  // Join Termin-Room
  socket.on('join-termin', (terminId) => {
    socket.join(`termin-${terminId}`);
    console.log(`[Socket.io] Client ${socket.id} joined termin-${terminId}`);
  });

  // Leave Termin-Room
  socket.on('leave-termin', (terminId) => {
    socket.leave(`termin-${terminId}`);
    console.log(`[Socket.io] Client ${socket.id} left termin-${terminId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] ❌ Client getrennt: ${socket.id}`);
  });
});

// ⭐ WICHTIG: server.listen statt app.listen!
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`[Socket.io] WebSocket-Server aktiv`);
});