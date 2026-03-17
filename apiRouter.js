// imports
var express = require('express');
var userCtrl = require('./routes/usersCtrl');
var messageCtrl = require('./routes/messagesCtrl');

// router
exports.router = (function() {
    var apiRouter = express.Router();//
    // users routes
    apiRouter.route('/users/register/').post(userCtrl.register);// 
    apiRouter.route('/users/login/').post(userCtrl.login);
    apiRouter.route('/users/profile/').get(userCtrl.getUserProfile);
    apiRouter.route('/users/profile/').put(userCtrl.updateUserProfile); 
    // messages routes
    apiRouter.route('/messages/new').post(messageCtrl.createMessage);
    apiRouter.route('/messages/').get(messageCtrl.listMessages);
    return apiRouter;
})();  