// imports
var express = require('express');
var userCtrl = require('./routes/usersCtrl');

// router
exports.router = (function() {
    var apiRouter = express.Router();//
    // users routes
    apiRouter.route('/users/register').post(userCtrl.register);// 
    apiRouter.route('/users/login').post(userCtrl.login);

    return apiRouter;
})();