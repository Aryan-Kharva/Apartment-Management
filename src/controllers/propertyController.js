const model = require('../models/property');
const tenant = require('../models/tenant');
const User = require('../models/user');

exports.index = async (req, res, next)=>{
    let user = await User.findById(req.session.user);
    model.find()
    .then(properties => res.render('./property/index', {properties, user}))
    .catch(err => next(err));
};

exports.new = (req, res)=>{
    res.render('./property/new');
};


exports.create = (req, res, next) => {
    
    let property = new model(req.body);
    
    if(property.bedroom == 'One'){
        property.bath = 'One';
        property.squareFootage = '800';
        property.images = '/images/oneBedroom.jpg';
    } else if(property.bedroom == 'Two'){
        property.bath = 'Two';
        property.squareFootage = '1100';
        property.images = '/images/twoBedroom.jpg';
    } else if(property.bedroom == 'Three'){
        property.bath = 'Two';
        property.squareFootage = '1400';
        property.images = '/images/threeBedroom.jpg';
    }
    
    // Save the property
    property.save()
    .then((property) => {
        req.flash('success', 'You have successfully added property');
        res.redirect('/properties');
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        if(err.code === 11000) {
            req.flash('error', 'Unit number has been used');  
            return res.redirect('/properties/new');
        }

        next(err);
    });
};

exports.show = (req, res, next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
    
    model.findById(id)
    .then((property) => {
        if(property) {
            User.findById(req.session.user)
            .then(currentUser => {
                res.render('./property/show', {property, user: currentUser, userType: currentUser ? currentUser.userType : null });
            })
            
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
    
   
};

exports.apply = (req, res, next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
    
    
    model.findById(id)
    .then(property => {
        if(property) {
            
            User.findById(req.session.user)  
            .then(currentUser => {
                if(currentUser) {
                    res.render('./property/apply', {property, user: currentUser});
                } else {
                    let err = new Error('Cannot find user information');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        } else {
            let err = new Error('Cannot find a property with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.submitApplication = (req, res, next) => {
    
    let application = new tenant({
        unitNumber: req.body.propertyId,
        tenant: req.session.user,         
        moveInDate: req.body.moveInDate,
        employmentStatus: req.body.employmentStatus,
        annualIncome: req.body.annualIncome,
        additionalNotes: req.body.additionalNotes
    });

    application.save()
    .then(application => {
        req.flash('success', 'Application submitted successfully');
        req.session.save(()=>{
            res.redirect('/properties');
        })
        return;
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err);
    });
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;

    model.findById(id)
    .then(property => {
        if(property) {
            res.render('./property/edit', {property});
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));

};

exports.update = (req, res, next) => {
    let id = req.params.id;
    
    model.findByIdAndUpdate(id, req.body, 
        { 
            runValidators: true,
            new: true 
        })
        .then(property => {
            if (property) {
                req.flash('success', 'You have successfully updated property');
                res.redirect('/users/dashboard');
            } else {
                let err = new Error('Cannot find a property with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
                console.error('Validation Errors:', err.errors);
            }
            
            if (err.code === 11000) {
                req.flash('error', 'Unit number has been used');
                return res.redirect('/properties/new');
            }
            
            next(err);
        });
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;

    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(property => {
        if(property){
            req.flash('success', 'You have successfully deleted property');
            res.redirect('/properties');
        } else {
            let err = new Error('Cannot find a item with id ' + id);
        err.status = 404;
        next(err);
        }
    })
    .catch(err => next(err));
};
