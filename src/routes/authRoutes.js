let express = require("express");
let authRouter = express.Router();
let MongoClient = require('mongodb').MongoClient;
let passport = require('passport');
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

let router = function(){
	authRouter.route('/signUp')
		.post((req, res) => {
			console.log(req.body);
			const url = 'mongodb://localhost:27017';
			
			(async function(){
				//connection to mongoserver
				let connection = await MongoClient.connect(url);

				//getting database
				let db = connection.db('ToDo');

				//getting auth collection 
				let authTable = db.collection('auths');

				//creating user
				let user = {
					name: req.body.name,
					username: req.body.username,
					password: req.body.password,
					active: false
				};

				//checking availability of username
				let userSearch = await authTable.findOne({username: req.body.username });
				console.log(userSearch);
				
				if(userSearch){
					console.log("Username Already Present");
					res.statusCode = 400;
					res.statusMessage = "Username Already Present";
					res.send('Sign Up failed');
					return;
				}

				//inserting new user
				let authInsertRes = await authTable.insert(user);

				if(authInsertRes && authInsertRes.insertedCount){
					console.log("redirecting to send mail");
					connection.close();
					res.redirect(`/api/auth/sendMail?user=${req.body.username}`);
				};
		})();
	});

	authRouter.route('/signIn')
		.post(passport.authenticate('local', {
			failureRedirect: '/' 
		}), function(req, res) {
			res.statusCode = 200;
			res.statusMessage = "Login Successful";
			res.send('redirect to /profile');
		});
	
	authRouter.route('/signOut')
		.get( (req, res) =>{
			req.session.destroy();
			res.statusCode = 200;
			res.statusMessage = "Session deleted";
			res.send("User Logged Out");
		});
	//sending mail for verification of username
	authRouter.route('/sendMail')
		//pending -> authenticate this route
		.get((req, res) =>{
			(async function() {

				var smtpTransport = await nodemailer.createTransport({
			        service: "Gmail",
			        auth: {
			            user: "kaushalesh.diary@gmail.com",
			            pass: "diary@44"
			        }
			    });

			    console.log("transporter created");
				let rand=Math.floor((Math.random() * 10000) + 97);
				let host=req.get('host');
    			let link="http://"+req.get('host')+"/verifyMail?id="+rand;

			    var mailOptions = {
			        to: req.param('user'), 
			        subject: "Please confirm your Email account",
			        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
			    }
			    smtpTransport.sendMail(mailOptions, function(error, response){
			        if(error){
						console.log(error);
						res.statusCode = 400;
						res.statusMessage = "Invalid Mail";
			            res.send('Sign Up failed');
			        }else{

			        	// adding user in inactive user table
			        	const url = 'mongodb://localhost:27017';
			        	console.log("url generated");
			        	let user = {
		        			username : req.param('user'),
		        			hash : rand
		        		}
						MongoClient.connect(url, function(err, client){
							let db = client.db('ToDo');
							let inactiveTable = db.collection('inactiveUsers');
							inactiveTable.insertOne(user, function(err, results){
								client.close()

								res.statusCode = 201;
								res.statusMessage = "Varification mail sent";
								res.send('Sign Up successful Varify your mail');
							});
						});
			        }
				});
			})();
		});

	// Page not found
	authRouter.route('/*')
		.all( (req, res) => {
			res.statusCode = 404;
			res.statusMessage = "Page Not Found";
			res.send("Page not found");
		});

	return authRouter;
}

module.exports = router;
