var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	MongoClient = require('mongodb').MongoClient;

module.exports = function(){
	console.log('LocalStrategy');
	passport.use(new LocalStrategy({
		usernameField : 'username',
		passwordField : 'password'
	},
	function(username, password, done){
		var url = 'mongodb://localhost:27017';
		MongoClient.connect(url, function(err, client){
			var db = client.db('ToDo');
			var authTable = db.collection('auths');
			authTable.findOne({
				username: username
			},
			function (err, results){
				if(results && results.password === password && results.active){
					console.log('Matched');
					var user = results;
					done(null, user);
				}
				else{
					console.log('Failed');
					done(null, false);
				}
			});
		});
	})); 
};