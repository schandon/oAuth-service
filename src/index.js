const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(
  session({ secret: 'your_secret_key', resave: false, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Aqui você pode acessar as informações do usuário, incluindo o e-mail e a foto
      const userProfile = {
        displayName: profile.displayName,
        email: profile.emails[0].value, // O primeiro e-mail associado
        photo: profile.photos[0].value, // URL da foto de perfil
        token: accessToken,
      };
      return done(null, userProfile);
    }
  )
);

// Route to start authentication
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`
    <h1>Bem-vindo, ${req.user.displayName}!</h1>
    <p>Email: ${req.user.email}</p>
    <p>token: ${req.user.token}</p>
    <img src="${req.user.photo}" alt="Foto de perfil" style="width: 150px; height: 150px;"/>
    <p>Trocando de Login:</p><a href="/auth/google">aqui 🐀🪽</a>
  `);
});

// Home route
app.get('/', (req, res) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>');
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
