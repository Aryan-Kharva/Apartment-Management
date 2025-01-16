const express = require('express');
const controller = require('../controllers/requestController');
const { isLoggedIn, isTenant, isManagement } = require('../middlewares/auth');

const router = express.Router();

router.get('/', isLoggedIn, isTenant, controller.index);

router.post('/', isLoggedIn, isTenant, controller.create);

router.post('/:requestId', isLoggedIn, isManagement, controller.markComplete);

module.exports = router;