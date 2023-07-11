
require('dotenv').config({ path: './config/.env' });
// const cronController = require('./controllers/Cron');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(express.Router());
const PORT = process.env.PORT;


const depositRoute = require('./routes/deposit');
const adminRoute = require('./routes/admin');

const cronController = require('./controllers/Cron');


app.use('/api/deposit', depositRoute);
app.use('/api/admin', adminRoute);

cronController.start();

app.listen(PORT, ()=> {
    console.log(`Server started listening to port ${PORT} successfully`); 
    const APP_MODE = process.env.APP_MODE || 'TESTNET';
    console.log('App is running on', APP_MODE);
});
