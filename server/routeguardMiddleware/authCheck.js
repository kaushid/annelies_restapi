const jwt = require('jsonwebtoken');
const serverConfig = require('../server.config');

module.exports = function (req, res, next) {
    try {
        /*
            Setting the JWT to request authorization header instead of body 
            Authorization Header : Bearer JWToken
        */ 
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, serverConfig.jwtSecretKey);
        req.decodedUserData = decoded;
        next();
    } catch (err) {
        //Unauthorize Status
        return res.status(401).json({
            message: 'Authentication Failed'
        })
    }
} ;