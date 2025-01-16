const express = require('express');
const controller = require('../controllers/propertyController');
const {upload} = require('../models/property');
const {isLoggedIn, isSeller, isManagement} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator')

const router = express.Router();


router.get('/', controller.index);

router.get('/new', isLoggedIn, isManagement, controller.new);

router.post('/', isLoggedIn, isManagement, controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/apply', validateId, isLoggedIn, controller.apply);

router.post('/:id/apply', validateId, isLoggedIn, controller.submitApplication);

router.get('/:id/edit', validateId, isLoggedIn, isManagement, controller.edit);

router.put('/:id', validateId, isLoggedIn, isManagement, controller.update);

router.delete('/:id', validateId, isLoggedIn, isManagement, controller.delete);

module.exports = router;