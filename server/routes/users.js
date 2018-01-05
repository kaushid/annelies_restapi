const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const serverConfig = require('../server.config');
const Users = require('../models/user');
//userd by bcrypt to add 10 random letters to password and then hash it 
const saltRounds = 10;

router.post('/signup', function (req, res, next) {

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
            const user = new Users({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                name : req.body.name,
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

});

module.exports = router;