// imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');    

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

//Routes
module.exports = {
    register: function(req, res) {
        //TODO: To implement
        var email = req.body.email;
        var name = req.body.name;
        var pw = req.body.pw;
        var bio = req.body.bio;
        
        if (email == null || name == null || pw == null) {
            return res.status(400).json({ 'error': 'Missing required fields (email, name, and password are required)' });
        }

        if(name.length >= 15 || name.length <= 5 ) {
            return res.status(400).json({ 'error': 'Missing required fields (name must be between 5 and 15 characters)' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'Invalid email' });
        }

        if (!PASSWORD_REGEX.test(pw)) {
            return res.status(400).json({ 'error': 'Invalid password(must length 4-8 and include 1 number at least)' });
        }

        asyncLib.waterfall([ // on utilise la waterfall pour éviter les callback hell et gérer les erreurs plus facilement
            function(done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email } // verifie si l'email existe déjà
                })
                .then(function(userFound) { // si la promesse est résolue, on reçoit l'utilisateur trouvé ou null
                    done(null, userFound);
                })
                .catch(function(err) { // si la promesse est rejetée, on reçoit une erreur
                    return res.status(500).json({ 'error': 'Unable to verify user' }); 
                });
            },
            function(userFound, done){
                if (!userFound) { // si l'email n'existe pas, on peut créer le compte
                    bcrypt.hash(pw, 5, function(err, bcryptedPassword) { // on hash le mot de passe avec un salt de 5
                        done(null, userFound, bcryptedPassword);// on passe à la fonction suivante en lui passant l'utilisateur trouvé (null) et le mot de passe hashé
                    });
                } else {
                    return res.status(409).json({ 'error': 'User already exists' });
                }
            },
            function(userFound, bcryptedPassword, done) {
                var newUser = models.User.create({ // on crée l'utilisateur dans la base de données
                    email: email,
                    name: name,
                    pw: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0
                })
                .then(function(newUser) {
                    done(newUser);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'Unable to create user' });
                });
            }

        ], function(newUser) {
            if (newUser) {
                return res.status(201).json({
                    'userId': newUser.id
                });
            } else {
                return res.status(500).json({ 'error': 'cannot add user' });
            }
        });
    },

    login: function(req, res) {
        //TODO: To implement
        var email = req.body.email;
        var pw = req.body.pw;

        if(email == null || pw === null) {
            return res.status(400).json({ 'error': 'Missing required fields' });
        }

        // TODO verify email format and password strength etc.

        asyncLib.waterfall([ // on utilise la waterfall pour éviter les callback hell et gérer les erreurs plus facilement
            function(done) {
                models.User.findOne({
                    where: { email: email }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'Unable to verify user' });
                });
            },
            function(userFound, done) {
                 if (userFound) {
                    bcrypt.compare(pw, userFound.pw, function(errBycrypt, resBycrypt) { // on compare le mot de passe envoyé avec le mot de passe hashé stocké dans la base de données
                        done(null, userFound, resBycrypt);
                    });
                } else {
                    return res.status(404).json({ 'error': 'User not exist in DB' });
                }
            },
            function(userFound, resBycrypt, done) {
                if(resBycrypt) {
                    done(userFound);
                } else {
                    return res.status(403).json({ 'error': 'Invalid password' });
                }
            }
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json({
                    'id': userFound.id,
                    'token': jwtUtils.generateTokenForUser(userFound) // on génère un token pour l'utilisateur connecté
                });
            } else {                return res.status(500).json({ 'error': 'Cannot log user in' });
            }
        });
    }, 
    getUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth); // on récupère l'id de l'utilisateur à partir du token

        if (userId < 0) {
            return res.status(400).json({ 'error': 'Wrong token' });
        }
        models.User.findOne({
            attributes: ['id', 'email', 'name', 'bio'],
            where: { id: userId }
        })
        .then(function(user) {
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({ 'error': 'User not found' });
            }
        })
        .catch(function(err) {
            res.status(500).json({ 'error': 'Cannot fetch user' });
        });
    },
    updateUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth); // on récupère l'id de l'utilisateur à partir du token

        // parameters
        var bio = req.body.bio;
        
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'bio'],
                    where: { id: userId }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    res.status(500).json({ 'error': 'Cannot fetch user' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio) // si le champ bio est renseigné, on le met à jour, sinon on garde l'ancien    
                    })
                    .then(function() {
                        done(userFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({ 'error': 'Cannot update profile' });
                    });
                } else {
                    res.status(404).json({ 'error': 'User not found' });
                }
            }
        ],
        function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'Cannot update user profile' });
            }
        });
    }
}