var express = require('express');
var router = express.Router();
const ratingController = require('../controllers/ratingController');

router.get('/all', ratingController.getRating);
router.post('/add', ratingController.addRating);
module.exports = router;