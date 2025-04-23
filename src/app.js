// require modules
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// route files
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');

// create app
const app = express();

// configure app
const port = 4000;
const host = 'localhost';
const mongUri = 'mongodb+srv://admin:admin123@cluster0.xrvr1yc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// connect to MongoDB
mongoose.connect(mongUri)
.then(() => {
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    });
})
.catch(err => console.log(err.message));

// middleware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongoUrl: mongUri }),
        cookie: { maxAge: 60 * 60 * 1000 }
    })
);

app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

// routes
app.get('/', (req, res) => {
    res.render('index');
});

app.use('/properties', propertyRoutes);
app.use('/users', userRoutes);
app.use('/requests', requestRoutes);

// error handling
app.use((req, res, next) => {
    const err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }

    res.status(err.status);
    res.render('error', { error: err });
});

module.exports = app;