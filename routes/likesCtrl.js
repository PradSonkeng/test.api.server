// imports
var models = require('../models');
var jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async');

// const

// routes
module.exports = {
    likePost: function(req, res) {
         // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth); // on récupère l'id de l'utilisateur à partir du token
        // parameters
        var messageId = parseInt(req.query.messageId);// on parse l'id du message à liker à partir des paramètres de la requête
        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where: {id: messageId}
                })
                .then(function(messageFound){
                    done(null, messageFound);
                })
                .catch(function(err){
                    return res.status(500).json({'error':'unable to verify the message'});
                })
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: {Id: userId}
                    })
                    .then(function(userFound) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unble to verify user'});
                    });
                } else {
                    return res.status(404).json({'error':'post already liked'});
                }
            },
            function(messageFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {messageId: messageId, userId: userId}
                    })
                    .then(function(isUserAlreadyLiked) {
                        done(null, messageFound, userFound, isUserAlreadyLiked);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unable to verify is user already liked'});
                    });
                } else {
                    return res.status(404).json({'error':'user not found'});
                }
            },
            function(messageFound, userFound, isUserAlreadyLiked, done) {
                if(!isUserAlreadyLiked) {
                    messageFound.addUser(userFound)
                    .then(function(alreadyLikeFound) {
                        done(null, messageFound, userFound, isUserAlreadyLiked);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unable to like the post'});
                    });
                } else {
                    return res.status(409).json({'error':'post already liked'});
                }
            },
                function(messageFound, userFound, done) {
                    messageFound.update({
                        likes: messageFound.likes + 1
                    }).then(function() {
                        done(messageFound);
                    }).catch(function(err) {
                        return res.status(500).json({'error':'unable to update like counter'});
                    });
                }

        ], function(messageFound) {
            if(messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({'error':'cannot update message like counter'});
            }
        });

    },
    unlikePost: function(req, res) {
         // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth); // on récupère l'id de l'utilisateur à partir du token
        // parameters
        var messageId = parseInt(req.query.messageId);// on parse l'id du message à liker à partir des paramètres de la requête
        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where: {id: messageId}
                })
                .then(function(messageFound){
                    done(null, messageFound);
                })
                .catch(function(err){
                    return res.status(500).json({'error':'unable to verify the message'});
                })
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: {Id: userId}
                    })
                    .then(function(userFound) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unble to verify user'});
                    });
                } else {
                    return res.status(404).json({'error':'post already liked'});
                }
            },
            function(messageFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {messageId: messageId, userId: userId}
                    })
                    .then(function(isUserAlreadyLiked) {
                        done(null, messageFound, userFound, isUserAlreadyLiked);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unable to verify is user already liked'});
                    });
                } else {
                    return res.status(404).json({'error':'user not found'});
                }
            },
            function(messageFound, userFound, isUserAlreadyLiked, done) {
                if(isUserAlreadyLiked) {
                    isUserAlreadyLiked.destroy() // on détruit la relation entre le message et l'utilisateur dans la table de jointure
                    .then(function() {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error':'unable to remove already liked post'});
                    });
                } else {
                    done(null, messageFound, userFound);// si l'utilisateur n'avait pas déjà liké le post, on ne fait rien et on continue le processus pour décrémenter le compteur de likes    
                }
            },
                function(messageFound, userFound, done) {
                    messageFound.update({
                        likes: messageFound.likes - 1
                    }).then(function() {
                        done(messageFound);
                    }).catch(function(err) {
                        return res.status(500).json({'error':'unable to update like counter'});
                    });
                }

        ], function(messageFound) {
            if(messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({'error':'cannot update message like counter'});
            }
        });

    }

}