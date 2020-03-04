let express = require("express");
let profileRouter = express.Router();
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;


//database variables
let url = 'mongodb://localhost:27017';
let taskTableName = 'task';
let listTableName = 'list';
let userTableName = 'userList';
let authTableName = 'auths';
let dbName = 'ToDo';


let router = function(){
	profileRouter.use((req, res, next) => {
		if(!req.user){
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
					res.render(
					'profile',
						{
							user 
						}
					);
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
						if(todoList.personalListIds[i] == lastEdited){
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

					user.tasks = taskList.listOfTask;

					await connection.close();
					res.render(
						'profile',
							{
								user
							}
					)
				}
			})();
		});

	profileRouter.route('/:id')
		.get( (req, res)=>{
			let url = 'mongodb://localhost:27017';
			(async function(){
				let connection = await MongoClient.connect(url);
				let db = connection.db('ToDo');

				//getting todo table
				let todoTable = db.collection('todos');

				//getting task list of user requested ToDo
				let taskList = await todoTable.findOne({"_id" : new ObjectId(req.params.id)});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<taskList.usernames.length; i++){
					if(taskList.usernames[i]==req.user.username){
						validUser = true;
						break;
					}
				}

				if(!validUser){
					await connection.close();
					res.send("Unauthorize access");
				}

				else{
					result = {
						tasks : []
					}

					//getting all task of a ToDo
					for(let i=0; i<taskList.tasks.length; i++){
						task = {
							Name : taskList.tasks[i].Name,
							dueDate : taskList.tasks[i].dueDate,
							totalSubTask : taskList.tasks[i].totalSubTask,
							completedSubTask : taskList.tasks[i].completedSubTask
						}
						result.tasks.push(task);
					}

					let userTable = db.collection('usersList');
					await userTable.updateOne({username: req.user.username}, {$set : { lastEdited : req.params.id}}); 
					await connection.close();

					res.send(result);
					// res.render(
					// 	'taskList',
					// 	{
					// 		result
					// 	}
					// )
				}
			})();
		});
	profileRouter.route('/:id/:subTask')
		.get((req, res) =>{
			let url = 'mongodb://localhost:27017';
			(async function(){
				let connection = await MongoClient.connect(url);
				let db = connection.db('ToDo');

				//getting todo table
				let todoTable = db.collection('todos');

				//getting task list of user requested ToDo
				let taskList = await todoTable.findOne({"_id" : new ObjectId(req.params.id)});

				let validUser = false;

				for(let i=0; i<taskList.usernames.length; i++){
					if(taskList.usernames[i]==req.user.username){
						validUser = true;
						break;
					}
				}

				if(!validUser){
					await connection.close();
					res.send('Unauthorize access');
				}

				else{
					result = {
						subTasks : [],
						notes : ""
					}

					for(let i=0; i<taskList.tasks.length; i++){
						if(taskList.tasks[i].taskName==req.params.subTask){
							result.subTasks = taskList.tasks[i].subTasks,
							result.notes = taskList.tasks[i].notes;
							break;
						}
					}

					await connection.close();
					res.send(result);
					// res.render(
					// 	'subtasks',
					// 	{	
					// 		result
					// 	}
					// )
				}
			})();
		});
	return profileRouter;
}

module.exports = router;