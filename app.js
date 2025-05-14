require("dotenv").config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const http = require('http');
const cors = require('cors');
const multer = require('multer');
const { connectToMongoDb } = require("./config/db");

// Importation des routes
const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');
const osRouter = require('./routes/osRouter');
const commandeRouter = require('./routes/commandeRouter');
const produitRouter = require('./routes/produitRouter');
const paiementRouter = require("./routes/paiementRouter");
const panierRouter = require("./routes/panierRouter");
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();


require('dotenv').config();
// Configuration Multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images (jpeg, jpg, png, gif) sont autorisées'));
  }
});

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  exposedHeaders: ['*', 'Authorization']
}));

// Middlewares globaux
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configuration session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key-pfe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 jour
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Middleware pour ajouter Multer à la requête
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Middleware de debug session
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log("Session ID:", req.sessionID);
    next();
  });
}

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/os', osRouter);
app.use('/commande', commandeRouter);
app.use('/produit', produitRouter);
app.use("/paiement", paiementRouter);
app.use("/panier", panierRouter);
app.use("/upload", uploadRoutes);
app.use('/files', express.static(path.join(__dirname, 'public', 'files')));

// Dans app.js ou server.js



// Gestion des erreurs 404
app.use((req, res, next) => {
  next(createError(404, 'Endpoint non trouvé'));
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      status: 400,
      message: 'Erreur de téléchargement de fichier',
      details: err.message 
    });
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Configuration du serveur
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  connectToMongoDb()
    .then(() => console.log(`✅ Connecté à MongoDB`))
    .catch(err => console.error('❌ Erreur MongoDB:', err));
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

module.exports = app;