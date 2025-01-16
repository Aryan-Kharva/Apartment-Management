const model = require('../models/user');
const property = require('../models/property');
const tenant = require('../models/tenant');
const request = require('../models/request');

exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.contact = (req, res)=>{
    res.render('./user/contact');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success', 'You have successfully registered');
        req.session.save(()=>{
            return res.redirect('/users/login');
        });
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            req.session.save(()=>{
                return res.redirect('/users/new');
            })
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            req.session.save(()=>{
                return res.redirect('/users/new');
            })
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong Email Address');
            req.session.save(()=>{
                res.locals.errorMessages = req.flash('error');
                res.status(400).render('./user/login');
            });
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    req.session.save(()=>{
                        return res.redirect('/');
                    })
            } else {
                req.flash('error', 'Wrong Password'); 
                req.session.save(()=>{
                    res.locals.errorMessages = req.flash('error');
                    return res.status(400).render('./user/login');
                });
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    
    
    model.findById(id)
        .then(user => {
            if (user.userType === 'management' || user.userType === 'maintenance') {
                Promise.all([
                    tenant.find({}).populate('tenant'), 
                    property.find({}), 
                    request.find({}),
                    model.find({}) 
                ])
                .then(([tenants, properties, requests, users]) => {
                    res.render('./user/managementDashboard', {
                        user: user, 
                        tenants,
                        properties,
                        requests,
                        users,
                        userType: user.userType 
                    });
                })
                .catch(err => next(err));
            } 
            
            else if (user.userType === 'potential' || user.userType === 'tenant') {
                tenant.findOne({ tenant: id })
                    .then(tenantInfo => {
                        if (tenantInfo) {
                            property.findById(tenantInfo.unitNumber)
                                .then(propertyInfo => {
                                    res.render('./user/dashboard', {
                                        user,
                                        tenantInfo,
                                        propertyInfo,
                                        userType: user.userType 
                                    });
                                })
                                .catch(err => next(err));
                        } else {
                            res.render('./user/dashboard', {
                                user,
                                tenantInfo: null,
                                propertyInfo: null
                            });
                        }
                    })
                    .catch(err => next(err));
            }
            
            else {
                req.flash('error', 'Invalid user type');
                return res.redirect('/');
            }
        })
        .catch(err => next(err));
};

exports.update = (req, res, next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
    
    
    tenant.findOne({ tenant: id }).populate('tenant').populate('unitNumber')
    .then(tenant => {
        if(tenant) {
            res.render('./user/application', {tenant});
        } else {
            let err = new Error('Cannot find a tenant with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.submitUpdate = (req, res, next) => {
    
    let tenantId = req.params.id;

    tenant.findByIdAndUpdate(tenantId, { applicationStatus: req.body.applicationStatus, 
        active: req.body.active, leaseEnd: req.body.leaseEnd, 
        leaseStart: req.body.leastStart, activeLease: req.body.activeLease == 'Yes' ? true : false }).populate('tenant')
        .then((tenant)=>{
            if (!tenant) {
                let err = new Error('Tenant not found.')
                err.status = 404;
                return next(err);
            }

            model.findByIdAndUpdate(tenant.tenant._id, { userType: 'tenant'})
                .then(()=>{
                    req.flash('success', 'Application updated successfully');
                    req.session.save(()=>{
                        res.redirect('/users/dashboard');
                    });
                    return;
                })
                .catch(err=>next(err));
        })
        .catch(err=>{
            if(err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        })
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else {
            res.redirect('/');  
        }
    });
   
 };



