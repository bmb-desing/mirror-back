var express = require('express');
var router = express.Router();
const systemConroller = require('../controllers/systemController');
router.get('/sidebar', systemConroller.getSidebar);
router.get('/menu', systemConroller.getMenu);
module.exports = router;