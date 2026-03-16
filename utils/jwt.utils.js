//imports
var jwt = require('jsonwebtoken');


//exported functions
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            id: userData.id,
            isAdmin: userData.isAdmin
        },
        process.env.JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    },
    parseAuthorization: function(authorization) { // on parse le header d'autorisation pour récupérer le token
        return (authorization != null) ? authorization.replace('Bearer ', '') : null; // on vérifie que le header d'autorisation n'est pas null et on supprime la partie "Bearer " pour ne garder que le token
    },
    getUserId: function(authorization) { // on récupère l'id de l'utilisateur à partir du token
        var id = -1;
        var token = module.exports.parseAuthorization(authorization); // on parse le header d'autorisation pour récupérer le token
        if(token != null) {
            try {
                var jwtToken = jwt.verify(token, process.env.JWT_SIGN_SECRET); // on vérifie que le token est valide et on récupère les données qu'il contient
                if(jwtToken != null) {
                    id = jwtToken.id; // on récupère l'id de l'utilisateur à partir des données du token
                }
            } catch(err) {
                console.log(err);
            }
        }
        return id; // on retourne l'id de l'utilisateur ou -1 si le token n'est pas valide ou si le header d'autorisation est null
    }
}