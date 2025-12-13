const express = require('express');
const {check} = require('express-validator');
const messageSchemas = require('../schemas/message-schemas');


const messageControllers = require('./../controllers/message-controllers');
const checkAccountLink = require('./../middleware/check-account-link');
const router = express.Router();

// IMPORTANT: Order of routes matters, if /:pid before /user/:uid -> /user would be used as a value for pid!
router.post('/', [
    check('from')
      .notEmpty()
      .isLength({min: 9, max: 20}),
    check('text')
      .notEmpty()
      .isString()
  ],
  checkAccountLink, // adds req.isLinked = t or f and req.farmerId if t, CALLED AFTER VALIDATION!
  messageControllers.parseResponse
);

module.exports = router;
