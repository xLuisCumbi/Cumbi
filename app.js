// Load environment variables from .env file
require('dotenv').config({ path: './config/.env' });

// Import required packages and modules
const cronController = require('./controllers/Cron');
const { engine } = require('express-handlebars');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const allowedOrigins = ['https://dash.cumbi.co', 'http://localhost:3000', 'https://stage.cumbi.co'];

// Apply middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 0,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './public/views');
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 70 * 60 * 1000 },
  })
);

// Define port number
const PORT = process.env.PORT;

// Import routes and database connection
const paymentUIController = require('./controllers/PaymentUI');
const depositRoute = require('./routes/deposit');
const userRoute = require('./routes/user');
const businessRoute = require('./routes/business');
const settingsRoute = require('./routes/setting');
const dbConnection = require('./config/db'); // Import the connectDB function

// Connect to the database
dbConnection();

// Define routes
app.get('/invoice/:depositID', paymentUIController);
app.get('/payment/:depositID', paymentUIController);
app.use('/api/deposit', depositRoute);
app.use('/api/user', userRoute);
app.use('/api/business', businessRoute);
app.use('/api/settings', settingsRoute);
app.get('*', (req, res) => {
  res.status(404).json({ message: 'NOT FOUND' });
});

// Start the cron job
cronController.start();

// Start the server
app.listen(PORT, () => {
  console.log(`Server started listening to port ${PORT} successfully`);
  const APP_MODE = process.env.APP_MODE || 'TESTNET';
  console.log('App is running on', APP_MODE);
});
