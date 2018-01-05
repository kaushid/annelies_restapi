const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const serverConfig = require('../server.config');
const checkAuth = require('../routeguardMiddleware/authCheck');

//Handle incoming GET request for /products
router.get('/', function (req, res, next) {
    Product.find()
        .select('name price _id')
        .exec()
        .then(function (docs) {
            let response = {};
            if (docs.length) {
                response = {
                    count: docs.length,
                    products: docs.map(function (doc) {
                        return {
                            name: doc.name,
                            price: doc.price,
                            _id: doc._id,
                            request: {
                                type: 'GET',
                                url: serverConfig.apiHostedBaseUrl + 'products/' + doc._id
                            }
                        }
                    })
                }

            } else {
                response = {
                    count: docs.length,
                    products: []
                }
            }
            res.status(200).json(response)
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            })
        });
});

//Handle incoming POST request for /products
router.post('/addProduct', checkAuth , function (req, res, next) {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(function (result) {
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: serverConfig.apiHostedBaseUrl + 'products/' + result._id
                }
            }
        })
    }).catch(function (err) {
        res.status(500).json({
            error: err
        })
    });
});


//Handle incoming GET request for /products/:productId
router.get('/:productId', function (req, res, next) {
    const productId = req.params.productId;
    Product.findById(productId)
        .exec()
        .then(function (doc) {
            if (doc) {
                res.status(200).json({
                    message: "Data Found",
                    data: doc
                });
            } else {
                res.status(404).json({
                    message: 'No valid entry found for provided id'
                })
            }

        }).catch(function (err) {
            res.status(500).json({
                error: err
            })
        })
});
//Handle incoming PATCH/UPDATE request for /products/:productId
router.patch('/:productId', checkAuth, function (req, res, next) {
    const productId = req.params.productId;
    const updatedOps = {};
    for (let ops of req.body) {
        updatedOps[ops.propName] = ops.value
    }
    //Product.update({ _id: productId }, { $set: { name: req.body.name, price: req.body.price } })
    Product.update({ _id: productId }, { $set: updatedOps })
        .exec()
        .then(function (result) {
            res.status(200).json(result)
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            })
        });


    res.status(200).json({
        message: 'Updated product with productId :' + productId
    })
});
//Handle incoming DELETE request for /products/:productId
router.delete('/:productId', checkAuth , function (req, res, next) {
    const productId = req.params.productId;
    Product.remove({ _id: productId })
        .exec()
        .then(function (result) {
            res.status(200).json(result)
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;