const Request = require('../models/request');
const Property = require('../models/property');
const User = require('../models/user');
const Tenant = require('../models/tenant');

exports.index = (req, res, next) => {

    Tenant.findOne({ tenant: req.session.user}).populate('tenant').populate('unitNumber')
        .then(user => {
            if (!user) {
                req.flash('error', 'You must be logged in to view requests');
                req.session.save(()=>{
                    res.redirect('/users/login');
                })
                return;
            }

            let propertyQuery;
            if (user.tenant.userType === 'management' || user.tenant.userType === 'maintenance') {
                propertyQuery = Property.find();
            } else if (user.tenant.userType === 'tenant' && user.tenant && user.tenant.unitNumber) {
                propertyQuery = Property.find({ unitNumber: user.tenant.unitNumber });
            } else {
                propertyQuery = Promise.resolve([]);
            }
            return Promise.all([
                propertyQuery,
                Request.find().populate('property').sort({ dateSubmitted: -1 }),
                Promise.resolve(user)
            ]);
        })
        .then(([properties, requests, user]) => {
            return res.render('./request/index', {
                requests,
                properties,
                user
            });
        })
        .catch(err => next(err));
};

exports.create = (req, res, next) => {
    
    let currentUser;

    let tenantId;

    User.findById(req.session.user)
        .then(user => {
            if (!user) {
                req.flash('error', 'You must be logged in to create a request');
                req.session.save(()=>{
                    res.redirect('/users/login');
                });
                return
            }

            currentUser = user;
            tenantId = user._id;
            return Property.findOne({ unitNumber: req.body.unit });
        })
        .then(property => {

            if (!property) {
                req.flash('error', 'Invalid unit number');
                req.session.save(()=>{
                    res.redirect('/requests');
                });
                return
            }

            const request = new Request({
                unitNumber: req.body.unit,
                description: req.body.additionalNotes,
                status: 'pending',
                dateSubmitted: new Date(),
                submittedBy: currentUser._id,
                property: property._id,
                tenant: tenantId
            });

            return request.save()
                .then(()=> {
                    req.flash('success', 'Maintenance request created successfully');
                    req.session.save(()=>{
                        res.redirect('/users/dashboard');
                    });
                    return
                })
                .catch(err=>{
                    console.error('Save Error:', err);
                    if (err.name === 'ValidationError') {
                        err.status = 400;
                        req.flash('error', 'Invalid request data');
                    }
                    next(err);
                });
        })
        .catch(err => {
            return next(err);
        });
};

exports.markComplete = (req, res, next) => {

    const requestId = req.params.requestId;

    Request.findByIdAndUpdate(requestId, { status: "completed"})
        .catch(err => next(err))


    req.flash('success', 'Maintenance Request Fulfilled')
    req.session.save(()=>{
        return res.redirect('/users/dashboard');
    });

}

