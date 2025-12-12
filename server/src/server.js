const pool = require('./config/database');
const express = require('express');

const messageRoutes = require('./../routes/message-routes');
const HttpError = require("./../models/http-error");

const server = express();
server.use(express.json());

// IMPORTANT -> reminder to set headers at the start of the request (FOR FUTURE FRONTEND)
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

// IMPORTANT -> define the main routes here if any
server.use('/message', messageRoutes); // express forwards requests to messageRoutes if the route starts with /message

// IMPORTANT -> handle unknown routes errors
server.use((req, res, next) => {
  throw new HttpError('Could not find this route!', 404);
});

// IMPORTANT -> handles all errors thrown
server.use((error, req, res, next) => {
  if (res.headersSent) { // if headers were already sent, we can't modify the response anymore, we pass it to the next error handler if any
    return next(error);
  }

  res.status(error.code || 500)
     .json({message: error.message || 'An error occurred!'});
});

const port = process.env.SERVER_PORT || 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});