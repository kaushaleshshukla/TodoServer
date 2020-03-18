let express = require("express");
let updateRouter = express.Router();
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;


//database variables
let url = 'mongodb://localhost:27017';
let taskTableName = 'task';
let listTableName = 'list';
let userTableName = 'usersList';
let authTableName = 'auths';
let dbName = 'ToDo';

let router = function() {

	updateRouter.use((req, res, next) => {
		if(!req.user){
			res.statusCode = 401;
			res.statusMessage = "Unauthorize access";
			res.send('You are not logged in :(');
		}
		else
			next();
	});

	updateRouter.route('/addList')
		.post((req, res) =>{
			// requirements -> newListName
			(async function(){

				// establising connection to database
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				// getting user table
				let userTable = db.collection(userTableName);

				//getting todo table
				let todoTable = db.collection(listTableName);

				

				todo = {
					name : req.body.newListName,
					listOfTask : [],
				}

				let result = await todoTable.insertOne(todo);

				let todoId = result.ops[0]._id.toString();

				let listupdate = await userTable.updateOne({username : req.user.username},
					{"$push" : {personalListIds : todoId}});

				let lastEditedUpdate = await userTable.updateOne({username : req.user.username},
					{"$set" : {lastAccessedListId : todoId}});

				await connection.close();

				res.statusCode = 201;
				res.statusMessage = "New List Added";
				res.send(todoId);
			})();
		});

	updateRouter.route('/addTask')
		.post( (req, res) =>{
			// requirements -> listId, newTaskName
			(async function(){

				// establising connection to database
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				//getting todo table
				let todoTable = db.collection(listTableName);
				let taskTable = db.collection(taskTableName);

				task = {
					listOfSubtask : []
				}

				let result = await taskTable.insertOne(task);

				let taskId = result.ops[0]._id.toString();

				taskList = {
					id : taskId,
					name : req.body.newTaskName,
					completed : false,
					important : false,
					notes : "",
					dueDate : ""
				}

				await todoTable.updateOne({"_id" : new ObjectId(req.body.listId)},
					{"$push" : {"listOfTask" : taskList}});

				await connection.close();

				res.statusCode = 201;
				res.statusMessage = "New Task Added";
				res.send(taskId);

			})();
		});

	updateRouter.route('/addSubtask')
		.post( (req, res) =>{
			// requirements -> listId, taskId, newSubtaskName
			(async function(){

				//pending -> check task in listId and authenticate user
				// establising connection to database
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				//getting todo table
				let taskTable = db.collection(taskTableName);

				subtask = {
					name : req.body.subtaskName,
					completed : false
				}

				await taskTable.updateOne({"_id" : new ObjectId(req.body.taskId)},
					{"$push" : {"listOfSubtask" : subtask}});

				await connection.close();

				res.statusCode = 201;
				res.statusMessage = "New Subtask added";
				res.send(req.body.newSubtaskName);
			})();
		});

	updateRouter.route('/updateList')
		.post( (req, res) =>{
			// requirements -> listId, newListName

			(async function(){

				//pending - user authentication
				// establising connection to database
			
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				let todoTable = db.collection(listTableName);

				//updating list name
				await todoTable.updateOne({"_id" : new ObjectId(req.body.listId)},
				{"$set" : {"name" : req.body.newListName}});

				await connection.close();
				
				res.statusCode = 200;
				res.statusMessage = "List updated";
     
				res.send(req.body.listId);
			})();
		});

	updateRouter.route('/updateTask')
		.post( (req, res) =>{
			// requirements -> for searching => listId, taskId 
			//				   new data => taskName, taskCompletedStatus, taskImportantStatus, taskNotes, taskDueDate

			(async function(){
				
				// establising connection to database
			
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				let todoTable = db.collection(listTableName);


				//----------------------------------------Resolve dueDate issue
				//updating task
				await todoTable.updateOne({"_id" : new ObjectId(req.body.listId)},
					{"$set" : {"listOfTask.$[elem].name" : req.body.taskName, "listOfTask.$[elem].completed" : req.body.taskCompletedStatus,
					"listOfTask.$[elem].important" : req.body.taskImportantStatus, "listOfTask.$[elem].notes" : req.body.taskNotes, "listOfTask.$[elem].dueDate" : req.body.taskDueDate} },
					{
						multi : false,
						arrayFilters : [ { "elem.id" : req.body.taskId} ]
					});

				 await connection.close();
				 
				 res.statusCode = 200;
				 res.statusMessage = "Task updated";

				 res.send(req.body.taskId);

			})();
		});

	updateRouter.route('/updateSubtask')
		.post( (req, res) =>{
			// requirements -> for searching => listId, taskid, subtaskName
			// 				   new date => newSubtaskName, subtaskCompletedStatus

			(async function(){

				// establising connection to database
			
				let connection = await MongoClient.connect(url);
				let db = connection.db(dbName);

				let taskTable = db.collection(taskTableName);

				await taskTable.updateOne( {"_id" : new ObjectId(req.body.taskId)}, 
					{"$set" : {"listOfSubtask.$[elem].name" : req.body.newSubtaskName, "listOfSubtask.$[elem].completed" : req.body.subtaskCompletedStatus} },
					{
						multi : false,
						arrayFilters : [ {"elem.name" : req.body.subtaskName} ]
					});
				
				await connection.close();
				
				res.statusCode = 200;
				res.statusMessage = "Subtask updated";

				res.send(req.body.newSubtaskName);

			})();
		});

	// Page not found
	updateRouter.route('/*')
		.all( (req, res) => {
			res.statusCode = 404;
			res.statusMessage = "Page Not Found";
			res.send("Page not found");
		});

	return updateRouter;
}

module.exports = router;