const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const helmet = require('helmet');

const httpStatus = require('http-status');
const routes = require('./routes/v1');
const morgan = require('./config/morgan');
const config = require('./config/config');
const ApiError = require('./utils/ApiError');
const { errorConverter, errorHandler } = require('./middlewares/error');

const app = express();
const bodyParser = require('body-parser');


//Morgan will handle logging HTTP requests,
// while winston logger will take care of your application-specific logs
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use((req, res, next) => {
  if (req.originalUrl === "/v1/booking/webhook") {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    bodyParser.json()(req, res, () => {
      bodyParser.urlencoded({ extended: true })(req, res, next);
    });
  }
});

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// Reroute all API request starting with "/v1" route
app.use('/v1', routes);

// NEW LINE ADDED: Connect API Routes
app.use("/api", routes);

// Mount the author routes BEFORE the 404 handler
// const authorRoutes = require('./routes/v1/auth.route');
// app.use('/api/authors', authorRoutes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// In app.js
// const authorRoutes = require('./routes/v1/author.route'); // Adjust path as needed
// app.use('/api/authors', authorRoutes);


// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// Static files middleware
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/_next', express.static(path.join(__dirname, '../.next')));

// Error handling for 404
app.use((req, res, next) => {
  if (req.path.startsWith('/_next/') || req.path.startsWith('/images/')) {
    res.status(404).send('Not found');
    return;
  }
  next();
});

module.exports = app;
