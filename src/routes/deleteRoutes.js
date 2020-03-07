let express  = require('express');
let deleteRouter = express.Router();
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
    deleteRouter.use((req, res, next) => {
		if(!req.user){
			res.statusCode = 401;
			res.statusMessage = "Unauthorize access";
			res.send('You are not logged in :(');
		}
		else
			next();
    });
    
    deleteRouter.route('/deleteList')
        .post( (req, res) =>{
            // required -> listId

            (async function(){

                // establising connection to database
				let connection = await MongoClient.connect(url);
                let db = connection.db(dbName);
                
                //getting userList table
				let userTable = db.collection(userTableName);

				//getting task list of user requested ToDo
				let userlist = await userTable.findOne({"username" : req.user.username});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<userlist.personalListIds.length; i++){
					if(userlist.personalListIds[i]==listId){
						validUser = true;
						break;
					}
                }
                
                if(!validUser){
                    await connection.close();
                    res.statusCode = 401;
                    res.statusMessage = "Unauthorize access";
                    res.send('Unauthorize access');
                }

                else{

                    //deleting list
                    let listTable = db.collection(listTableName);
                    await listTable.remove({"_id" : new ObjectId(listId)});

                    //removing listId from user personalList
                    await userTable.update({"username" : req.user.username},
                        {"$pull" : {"personalListIds" : listId}});

                    //getting updated task list of user requested ToDo
                    userlist = await userTable.findOne({"username" : req.user.username});
                    
                    // updating last accessedId if it is deleted
                    if(userlist.lastAccessedListId == listId){
                        if(userlist.personalListIds.length > 0)
                            lastAccessedListId = userlist.personalListIds[0];
                        else if(userlist.sharedListIds.length > 0)
                            lastAccessedListId = userlist.sharedListIds[0];
                        else
                            lastAccessedListId = "";
                    }

                                        
                    await connection.close();

                    res.statusCode = 200;
                    res.statusMessage = 'List deleted';
                    res.send('List deleted');

                }

            })();
            
        });
    
    deleteRouter.route('/deleteTask')
        .post( (req, res) =>{
            // required -> listId, taskId

            (async function(){

                // establising connection to database
				let connection = await MongoClient.connect(url);
                let db = connection.db(dbName);
                
                //getting userList table
				let userTable = db.collection(userTableName);

				//getting task list of user requested ToDo
				let userlist = await userTable.findOne({"username" : req.user.username});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<userlist.personalListIds.length; i++){
					if(userlist.personalListIds[i]==listId){
						validUser = true;
						break;
					}
                }

                if(!validUser){
                    for(let i=0; i<userlist.sharedListIds.length; i++){
                        if(userlist.sharedListIds[i]==listId){
                            validUser = true;
                            break;
                        }
                    }
                }

                if(!validUser){
                    await connection.close();
                    res.statusCode = 401;
                    res.statusMessage = "Unauthorize access";
                    res.send('Unauthorize access');
                }

                //checking validity of taskId
                let validTask = false;
                let listTable = db.collection(listTableName);
                let taskList = await listTable.findOne({ "_id" : new ObjectId(listId) });

                for(let i=0; i<taskList.listOfTask.length; i++){
                    if(taskList.listOfTask[i]==taskId){
                        validTask = true;
                        break;
                    }
                }

                if(!validTask){
                    await connection.close();
                    res.statusCode = 400;
                    res.statusMessage = "Bad request";
                    res.send("Task does not belong to List");
                }

                let taskTable = db.collection(taskTableName);
                await taskTable.remove({"_id" : new ObjectId(taskId)});
                
                await listTable.update({ "_id": new ObjectId(listId)},
                    {"$pull" : {"listOfTask" : { "id" : taskId } } });

                await connection.close();

                res.statusCode = 200;
                res.statusMessage = "Task deleted";
                res.send('Task deleted');

            })();
        });
    
    deleteRouter.route('/deleteSubtask')
        .post( (req, res) =>{
            // required -> listId, taskId, subtaskName

            (async function(){

                // establising connection to database
				let connection = await MongoClient.connect(url);
                let db = connection.db(dbName);
                
                //getting userList table
				let userTable = db.collection(userTableName);

				//getting task list of user requested ToDo
				let userlist = await userTable.findOne({"username" : req.user.username});


				//checking validity of user
				let validUser =false;

				for(let i=0; i<userlist.personalListIds.length; i++){
					if(userlist.personalListIds[i]==listId){
						validUser = true;
						break;
					}
                }

                if(!validUser){
                    for(let i=0; i<userlist.sharedListIds.length; i++){
                        if(userlist.sharedListIds[i]==listId){
                            validUser = true;
                            break;
                        }
                    }
                }

                if(!validUser){
                    await connection.close();
                    res.statusCode = 401;
                    res.statusMessage = "Unauthorize access";
                    res.send('Unauthorize access');
                }

                //checking validity of taskId
                let validTask = false;
                let listTable = db.collection(listTableName);
                let taskList = await listTable.findOne({ "_id" : new ObjectId(listId) });

                for(let i=0; i<taskList.listOfTask.length; i++){
                    if(taskList.listOfTask[i]==taskId){
                        validTask = true;
                        break;
                    }
                }

                if(!validTask){
                    await connection.close();
                    res.statusCode = 400;
                    res.statusMessage = "Bad request";
                    res.send("Task does not belong to List");
                }

                let taskTable = db.collection(taskTableName);
                await taskTable.update({"_id" : new ObjectId(taskId)},
                    { "$pull" : {listOfSubtask : { "name" : subtaskName }}});

                await connection.close();

                res.statusCode = 200;
                res.statusMessage = "Subtask deleted";
                res.send('Subtask deleted');
                
            })();
        });
    return deleteRouter;
}

module.exports = router;


