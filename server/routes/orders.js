const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const serverConfig = require('../server.config');

const Product = require('../models/product');
const Order = require('../models/order');

//Handle incoming GET request for /orders
router.get('/', function (req, res, next) {
    Order.find()
        .select('productId quantity _id')
        //merge up the reference object
        .populate('productId' , 'name')
        .exec()
        .then(function (docs) {
            let response = {};
            if (docs.length) {
                response = {
                    count: docs.length,
                    orders: docs.map(function (doc) {
                        return {
                            quantity: doc.quantity,
                            productId: doc.productId,
                            _id: doc._id,
                            request: {
                                type: 'GET',
                                orderUrl: serverConfig.apiHostedBaseUrl + 'orders/' + doc._id
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
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json({
                message: "Unable to get all orders",
                error: err
            });
        });
});
//Handle incoming POST request for /orders
router.post('/createOrder', function (req, res, next) {

    //Check if Product exist only then create order 
    Product.findById(req.body.productId)
        .then(function (product) {
            //if product not found it dont return error but instead null so check for truthy condition
            if (product === null) {
                return res.status(404).json({
                    message: "No Product Found"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                productId: req.body.productId
            });
            return order.save();
        }).then(function (result) {
            res.status(201).json({
                message: 'Order Stored',
                createdOrder: {
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    orderUrl: serverConfig.apiHostedBaseUrl + 'orders/' + result._id
                }
            });
        }).catch(function (err) {
            res.status(500).json({
                message: 'Failed to save the order',
                error: err
            });
        });
});
//Handle incoming GET request for /orders/:orderId
router.get('/:orderId', function (req, res, next) {
    const orderId = req.params.orderId;
    Order.findById(req.params.orderId)
        .select('_id productId quantity')
        .exec()
        .then(function (order) {
            if (order === null) {
                return res.status(404).json({
                    message: "No Order Found"
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: serverConfig.apiHostedBaseUrl + 'orders/'
                }
            })
        })
        .catch(function (err) {
            res.status(500).json({
                message: 'Failed to get the order',
                error: err
            });
        });
});
//Handle incoming DELETE request for /orders/:orderId
router.delete('/:orderId', function (req, res, next) {
    const orderId = req.params.orderId;
    Order.remove({ _id: orderId })
        .exec()
        .then(function (result) {
            res.status(200).json({
                message: "Order deleted Successfully"
            })
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;