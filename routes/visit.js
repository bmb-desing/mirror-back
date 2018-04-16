var express = require('express');
var router = express.Router();
const visitController = require('../controllers/visitController');
router.get('/all', visitController.getVisit);
router.post('/add', visitController.addVisit);
module.exports = router;