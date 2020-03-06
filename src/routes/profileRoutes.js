let express = require("express");
let profileRouter = express.Router();
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;


//database variables
let url = 'mongodb://localhost:27017';
let taskTableName = 'task';
let listTableName = 'list';
let userTableName = 'usersList';
let authTableName = 'auths';
let dbName = 'ToDo';


let router = function(){
	profileRouter.use((req, res, next) => {
		if(!req.user){
			res.statusCode = 401;
			res.statusMessage = "Unauthorize message";
			res.send('You are not logged in :(');
		}
		else
			next();
	});	

	profileRouter.route('/')
		.get((req, res) =>{
			(async function(){

				// establishing connection to database
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				// getting userTable
				let userTable = db.collection(userTableName);

				//getting last edited id of list
				let todoList = await userTable.findOne({"username" : req.user.username});
				let lastAccessedId = todoList.lastAccessedListId;

				//getting user name from auths table
				let authTable = db.collection(authTableName);
				let userInfo = await authTable.findOne({"username" : req.user.username});


				user = {
					name : userInfo.name,
					username : req.user.username,
					lists : [],
					tasks : []
				}

				if(!lastAccessedId){
					await connection.close();
					console.log('New User');
					res.statusCode = 200;
					res.statusMessage = "New user";
					res.send(user);
				}
				else{

					//getting todo table
					let todoTable =  db.collection(listTableName);

					//getting tast list of lastAccessed todo
					let taskList = await todoTable.findOne({"_id" : new ObjectId(lastAccessedId)});

					for(let i=0; i<todoList.personalListIds.length; i++){
						let result = await todoTable.findOne({ "_id" : new ObjectId(todoList.personalListIds[i])});
						list = {
							name : result.name,
							id : todoList.personalListIds[i],
							isCurrent : false
						}
						if(todoList.personalListIds[i] == lastAccessedId){
							list.isCurrent = true;
						}
						user.lists.push(list);
					}

					for(let i=0; i<todoList.sharedListIds.length; i++){
						let result = await todoTable.findOne({ "_id" : new ObjectId(todoList.sharedListIds[i])});
						list = {
							name : result.name,
							id : todoList.sharedListIds[i],
							isCurrent : false
						}
						if(todoList.sharedListIds[i] == lastEdited){
							list.isCurrent = true;
						}
						user.lists.push(list);
					}

					for(let i=0; i<taskList.listOfTask.length; i++)
						user.tasks.push(taskList.listOfTask[i]);
					

					await connection.close();

					res.statusCode = 200;
					res.statusMessage = "Old user";
					res.send(user);
				}
			})();
		});

	profileRouter.route('/:id')

	// pending -> check validity of id using try catch block
		.get( (req, res)=>{
			(async function(){

				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				//getting userList table
				let userTable = db.collection(userTableName);

				//getting task list of user requested ToDo
				let userlist = await userTable.findOne({"username" : req.user.username});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<userlist.personalListIds.length; i++){
					if(userlist.personalListIds[i]==req.params.id){
						validUser = true;
						break;
					}
				}

				if(!validUser){
					for(let i=0; i<userlist.sharedListIds.length; i++){
						if(userlist.sharedListIds[i]==req.params.id){
							validUser = true;
							break;
						}
					}
				}
				
				result = {
					tasks : []
				}

				if(!validUser){
					await connection.close();
					res.statusCode = 401;
					res.statusMessage = "Unauthorize access";
					res.send(result);
				}

				else{
					//getting all task of a ToDo
					let todoTable = db.collection(listTableName);
					let todoList = await todoTable.findOne({"_id" : new ObjectId(req.params.id)});
					result.tasks = todoList.listOfTask;

					let userTable = db.collection(userTableName);
					await userTable.updateOne({username: req.user.username}, {$set : { lastAccessedListId : req.params.id}}); 
					await connection.close();

					res.statusCode = 200;
					res.statusMessage = "response sent";
					res.send(result);
					
				}
			})();
		});
	profileRouter.route('/:id/:taskId')
	// pending : check validity of id and taskId  using try catch block
		.get((req, res) =>{
			(async function(){

				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				//getting userList table
				let userTable = db.collection(userTableName);

				//getting task list of user requested ToDo
				let userlist = await userTable.findOne({"username" : req.user.username});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<userlist.personalListIds.length; i++){
					if(userlist.personalListIds[i]==req.params.id){
						validUser = true;
						break;
					}
				}

				if(!validUser){
					for(let i=0; i<userlist.sharedListIds.length; i++){
						if(userlist.sharedListIds[i]==req.params.id){
							validUser = true;
							break;
						}
					}
				}
				
				result = {
					subtasks : []
				}

				if(!validUser){
					await connection.close();
					res.statusCode = 401;
					res.statusMessage = "Unauthorize access";
					res.send(result);
				}

				else{

					let taskTable = db.collection(taskTableName);
					let subtaskList = await taskTable.findOne({"_id" : new ObjectId(req.params.taskId)});
					result.subtasks = subtaskList.listOfSubtask;

					await connection.close();
					res.statusCode = 200;
					res.statusMessage = "response sent";
					res.send(result);
				}
			})();
		});
	return profileRouter;
}

module.exports = router;