var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
router.get('/', postController.getAll);
router.get('/index', postController.getIndex);
router.get('/search', postController.searchPosts);
router.get('/:category', postController.getPostsForCategory);
router.get('/:category/:post', postController.getForAlias);
module.exports = router;