const express = require('express');

const reportsFrequenciesControllers = require('./../controllers/report-frequencies-controllers');
const router = express.Router();

// IMPORTANT: It's called by admins presumably so no need for checkAccountLink
router.post('/', reportsFrequenciesControllers.getAllDueToday);

module.exports = router;

