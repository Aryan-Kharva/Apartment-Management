const Item = require('../models/property');
const tenant = require('../models/tenant');
const user = require('../models/user');

//Check if user is a guest
exports.isGuest = (req, res, next) => {
    if(!req.session.user){
        return next();
    }else{
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/dashboard');
    }
};


//Check if user is authenticated 
exports.isLoggedIn = (req, res, next) => {
    if(req.session.user){
        return next();
    }else{
        req.flash('error', 'You need to log in first');
        req.session.save(()=>{
            return res.redirect('/users/login');
        })
    }
};

exports.isManagement = (req, res, next) => {
    let id = req.session.user;
    user.findById(id)
        .then(user=>{
            if (user.userType === 'management') {
                return next();
            } else {
                let err = new Error();
                err.message = 'You are not allowed to access this resource';
                err.status = 403;
                return next(err);
            }
        })
        .catch(err=>next(err));
}

exports.isTenant = (req, res, next) => {
    let id = req.session.user;
    user.findById(id)
        .then(user=>{
            if (user.userType === 'potential') {
                req.flash('error', 'This page is for tenants only. Your application may still be pending.')
                req.session.save(()=>{
                    res.redirect('/users/dashboard');
                });
                return;
            } else if (user.userType === 'management') {
                req.flash('error', 'This page is for tenants only.')
                req.session.save(()=>{
                    res.redirect('/users/dashboard');
                });
            } else {
                return next();
            }
        })
        .catch(err=>next(err));
}