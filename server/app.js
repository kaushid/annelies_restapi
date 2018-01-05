const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
//For Logging out request
const morgan = require('morgan');
const mongoose = require('mongoose');

const serverConfig = require('./server.config');

mongoose.connect(serverConfig.mongoLabUrl);
//Use Default NodeJs Promise implementation instead of mongoose - to supress the deprication warning
mongoose.Promise = global.Promise;

/**
 * NOTE : all library middleware should be defined before our routes declaration
 */

//For Request Logging - we need to tell express to funnel all request through morgan middleware

app.use(cors());
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(morgan('combined'));

//Defining a filter for products order routes and its corresponding route handler
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

/**
 * Error handler function 
 * =======================
 * if request comes to this middleware then its sure that we dont have proper routes methods to handle
 * so need to create new Error object and passon to the next middleware
 */
app.use(function (req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
//Used for uncertan db errors which are not handles at the previous handler middleware
app.use(function (error, req, res, next) {
    res.status(error.status || 500)
    res.json({
        error: {
            message : error.message
        }
    })
});

app.listen(PORT, function (err) {
    if (err) {
        console.log('Something went wrong');
    } else {
        console.log("Listening to server at port :" + PORT);
    }
});