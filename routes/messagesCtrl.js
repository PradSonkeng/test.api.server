//imports
var models = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

//Constants
const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;

//Routes
module.exports = {
    createMessage: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth); // on récupère l'id de l'utilisateur à partir du token
        
        // parameters
        var title = req.body.title;
        var content = req.body.content;

        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }
        if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: { id: userId }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    res.status(500).json({ 'error': 'unable to verify user' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Message.create({
                        title: title,
                        content: content,
                        likes: 0,
                        UserId: userFound.id
                    })
                    .then(function(newMessage){
                        done(newMessage);
                    });  
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },

        ], function(newMessage) { 
            if(newMessage) {
                return res.status(201).json(newMessage);
            } else {
                return res.status(500).json({ 'error': 'cannot post message' });
            } 

        });
    },
    listMessages: function(req, res) {
        var fields = req.query.fields; // on peut choisir les champs à afficher dans la réponse en passant une query string "fields" avec les champs séparés par des virgules (ex: fields=title,content)
        var limit = parseInt(req.query.limit);// on peut limiter le nombre de messages retournés en passant une query string "limit" avec le nombre de messages à retourner (ex: limit=5)
        var offset = parseInt(req.query.offset);// on peut sauter un certain nombre de messages en passant une query string "offset" avec le nombre de messages à sauter (ex: offset=5)
        var order = req.query.order;// on peut trier les messages en passant une query string "order" avec le champ de tri et l'ordre de tri séparés par une virgule (ex: order=likes,desc)

        models.Message.findAll({
            order: [(order != null) ? order.split(',') : ['createdAt', 'DESC']], // si la query string "order" est renseignée, on trie les messages en fonction de son contenu, sinon on trie les messages par date de création décroissante
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null, // si la query string "fields" est renseignée et qu'elle n'est pas égale à "*", on affiche uniquement les champs spécifiés, sinon on affiche tous les champs
            limit: (!isNaN(limit)) ? limit : null, // si la query string "limit" est un nombre, on limite le nombre de messages retournés, sinon on ne limite pas le nombre de messages retournés
            offset: (!isNaN(offset)) ? offset : null, // si la query string "offset" est un nombre, on saute le nombre de messages spécifié,
            include: [{
                model: models.User,
                attributes: ['name']
            }]
        }).then(function(messages) {
            if (messages) {
                res.status(200).json(messages);
            } else {
                res.status(404).json({ 'error': 'no messages found' });
            }
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({ 'error': 'invalid fields' });
        })
    }
}