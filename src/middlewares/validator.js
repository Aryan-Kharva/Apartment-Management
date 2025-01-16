const Property = require('../models/property');


exports.validateId = (req, res, next) => {
    let id = req.params.id;
    Property.findById(id)
    .then(item => {
        next();
    })
    .catch(err => next(err))
};

