var express = require('express');
const commentController = require('../controllers/commentController');
var router = express.Router();
router.get('/', commentController.getAll);
router.post('/add', commentController.addComment);
module.exports = router;