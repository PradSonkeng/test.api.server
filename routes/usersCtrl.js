// imports
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var models = require('../models');

//Routes
module.exports = {
    register: function(req, res) {
        //TODO: To implement
        var email = req.body.email;
        var name = req.body.name;
        var pw = req.body.pw;
        var bio = req.body.bio;
        
        if (email == null || name == null || pw == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // TODO verify pseudo length,email format and password strength etc.

        models.User.findOne({
            attributes: ['email'],
            where: { email: email } // verifie si l'email existe déjà
        })
        .then(function(userFound) { // si la promesse est résolue, on reçoit l'utilisateur trouvé ou null
            if (!userFound) { // si l'email n'existe pas, on peut créer le compte

                bcrypt.hash(pw, 5, function(err, bcryptedPassword) { // on hash le mot de passe avec un salt de 5
                    var newUser = models.User.create({ // on crée l'utilisateur dans la base de données
                        email: email,
                        name: name,
                        pw: bcryptedPassword, // on stocke le mot de passe hashé
                        bio: bio,
                        isAdmin: 0
                    }) 
                    .then(function(newUser) { // si la promesse est résolue, on reçoit le nouvel utilisateur créé
                        return res.status(201).json({ userId: newUser.id }); // on retourne l'id de l'utilisateur créé
                    })
                    .catch(function(err) { // si la promesse est rejetée, on reçoit une erreur
                        return res.status(500).json({ error: 'Unable to create user' }); 
                    });
                });
            } else {
                return res.status(409).json({ error: 'User already exists' });
            }

        })
        .catch(function(err) { // si la promesse est rejetée, on reçoit une erreur
            return res.status(500).json({ error: 'Unable to verify user' }); 
            
        });

    },

    login: function(req, res) {
        //TODO: To implement
        var email = req.body.email;
        var pw = req.body.pw;
    }
}

 
