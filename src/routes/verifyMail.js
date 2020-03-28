let express = require('express');
let verifyRouter = express.Router();
let MongoClient = require('mongodb').MongoClient;

const func = function(){
	verifyRouter.route('/')
		.get( (req, res) => {
			console.log("----------"+req.param('id'));
			const url = 'mongodb://localhost:27017';
			(async function(){
				let connection = await MongoClient.connect(url);
				let db = await connection.db('ToDo');
				let inactiveTable = await db.collection('inactiveUsers');
				let result = await inactiveTable.findOne({hash : Number.parseInt(req.param('id'))});
				if(!result){
					res.send("Already Varified");
				}
				else{
					let userTable = await db.collection('usersList');
					let authTable = await db.collection('auths');
					let userList = {
						username : result.username,
						personalListIds : [],
						sharedListIds : [],
						lastAccessedListId : ""
					};
					//Creating a list for user
					await userTable.insert(userList);

					//setting user as active user
					await authTable.updateOne({username : result.username}, { $set: { active : true } });
					
					//deleting mapped verification link from database
					await inactiveTable.deleteOne({hash : Number.parseInt(req.param('id'))});

					res.send("Verified");
				}
				connection.close();
			})();
		});
	return verifyRouter;
};

module.exports = func;