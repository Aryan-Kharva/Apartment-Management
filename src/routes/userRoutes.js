const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn, isManagement} = require('../middlewares/auth');
const { validateId } = require('../middlewares/validator');

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.get('/contact', controller.contact);

router.post('/', isGuest, controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login', isGuest, controller.login);

router.get('/dashboard', isLoggedIn, controller.profile);

router.get('/logout', isLoggedIn, controller.logout);

router.get('/application/:id', validateId, isLoggedIn, isManagement, controller.update);

router.put('/application/:id', validateId, isLoggedIn, isManagement, controller.submitUpdate);

module.exports = router;