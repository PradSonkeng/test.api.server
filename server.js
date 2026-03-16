// imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;
require('dotenv').config(); // permet de charger les variables d'environnement à partir d'un fichier .env, ce qui est utile pour stocker des informations sensibles comme les clés d'API ou les mots de passe de base de données. Avec cette configuration, les variables définies dans le fichier .env seront accessibles via process.env.VARIABLE_NAME dans le code de l'application.

//extentiate server
var server = express();
//configurer le body parser pour traiter les données reçues
server.use(bodyParser.urlencoded({ extended: true })); //permet de traiter les données reçues dans le corps de la requete, en particulier les données de formulaire. L'option extended: true permet de traiter les données imbriquées, comme les objets ou les tableaux, ce qui est utile pour les formulaires complexes. Si extended: false, le body parser ne peut traiter que les données simples, comme les chaînes de caractères ou les tableaux plats.
server.use(bodyParser.json()); //permet de traiter les données reçues au format JSON, ce qui est courant dans les API REST. Avec cette configuration, le body parser peut analyser les données JSON et les rendre accessibles dans req.body, ce qui facilite la manipulation des données reçues dans les requêtes POST, PUT ou PATCH.

//confogurer les routes 
server.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html'); // précisse au server que la réponse recue doit être traité comme du html
    res.status(200).send('<h1>Bienvenue sur Prad$Bot server</h1>');
});

server.use('/api/', apiRouter); //toutes les routes définies dans apiRouter seront préfixées par /api. Par exemple, si apiRouter définit une route pour /users/register, elle sera accessible via /api/users/register. Cela permet d'organiser les routes de manière plus claire et de séparer les différentes parties de l'API.

//launch server
server.listen(process.env.PORT, function() {
    console.log('Server is running on port ' + process.env.PORT);
})