const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const serverConfig = require('../server.config');
const User = require('../models/user');
//userd by bcrypt to add 10 random letters to password and then hash it 
const saltRounds = 10;

router.post('/signup', function (req, res, next) {
    User.find({ email: req.body.email })
        .exec()
        .then(function (user) {
            //user is an empty array
            if (user.length) {
                //409 - conflict - resource already exists
                return res.status(409).json({
                    message: 'Email already used up'
                });
            } else {
                /**
                 * Hashing the password before saving to DB (Hashing One way process)
                 */
                bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                    // Store hash in your password DB.
                    if (err) {
                        return res.status(500).json({
                            message: 'Unable to save the user',
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            name: req.body.name,
                            password: hash
                        });
                        user.save()
                            .then(function (result) {
                                res.status(201).json({
                                    message: 'User Created'
                                });
                            })
                            .catch(function (err) {
                                return res.status(500).json({
                                    message: 'Unable to save the user',
                                    error: err
                                })
                            });
                    }
                });
            }
        })
        .catch(function (err) {
            return res.status(500).json({
                message: 'Unable to save the user',
                error: err
            })
        });
});

router.delete('/:userId', function (req, res, next) {
    User.remove({_id : req.parama.userId})
    .exec()     // return a promise object
    .then(function(result){
        res.status(200).json({
            message : 'User Deleted'
        });
    })
    .catch(function (err) {
        return res.status(500).json({
            message: 'Unable to delete the user',
            error: err
        })
    });
});
module.exports = router;