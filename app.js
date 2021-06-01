const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();





app.use(cors( {
  origin: "*",
  methods: ['GET',"POST","PATCH","DELETE","PUT"],
  allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept"}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Import Routes:
const usersRouter = require('./routes/users');
const productsRoute = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRoute = require('./routes/orders');

//Use Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRoute);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRoute);



module.exports = app;
