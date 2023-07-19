
require('dotenv').config({ path: './config/.env' });
const cronController = require('./controllers/Cron');
const { engine }  = require('express-handlebars');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './public/views');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 70 * 60 * 1000 }
}));


const PORT = process.env.PORT;
const paymentUIController = require('./controllers/PaymentUI');
const depositRoute = require('./routes/deposit');
const adminRoute = require('./routes/admin');


app.get('/invoice/:depositID', paymentUIController);
app.get('/payment/:depositID', paymentUIController);
app.use('/api/deposit', depositRoute);
app.use('/api/admin', adminRoute);
app.get('*', (req, res)=>{
    res.status(404).json({message: "NOT FOUND"});
});


cronController.start();

app.listen(PORT, ()=> {
    console.log(`Server started listening to port ${PORT} successfully`); 
    const APP_MODE = process.env.APP_MODE || 'TESTNET';
    console.log('App is running on', APP_MODE);
});
