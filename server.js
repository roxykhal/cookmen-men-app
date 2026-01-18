const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session')
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');
const authController = require('./controllers/auth.js')
const foodsController = require('./controllers/food.js');
const methodOverride = require('method-override');


//req.body will be undefined without this code (how express users client data from forms e.g. sign up form)
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);
app.set('view engine', 'ejs');
//add auth controller before isSignedin to prevent the middleware running before the /auth routes
//creates a redirect loop so the view never renders
app.use('/auth', authController);
app.use(methodOverride('_method'));
app.use(isSignedIn);

// Use relative paths so Node resolves local files correctly
const User = require('./models/user.js');

//import port from the .env file
const port = process.env.PORT || 3000;

//import foods controller to server.js
app.use('/users/:userId/foods', foodsController)

mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
});

mongoose.connection.on('connected', () => {
    console.log(`Connected to mongodb ${mongoose.connection.name}`)
});
mongoose.connection.on('error', (err) => {
    console.error('Mongo connection error:', err);
});


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Port is working on ${port}`);
})
