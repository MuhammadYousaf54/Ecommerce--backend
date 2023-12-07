const express = require('express');
const errorMiddleWare = require ("./middleware/error.js")
const cookieParser = require('cookie-parser');
const cors = require('cors')
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload")



// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
  }
  const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(fileUpload());


const product = require('./routes/productRoutes');
const order = require('./routes/orderRoutes');
const user = require('./routes/userRoutes');
const payment = require('./routes/paymentRoute');

app.use('/api/avi/',product)
app.use('/api/avi/',user)
app.use('/api/avi/',order)
app.use('/api/avi/',payment)

//for middleware errors
app.use(errorMiddleWare);





module.exports = app
