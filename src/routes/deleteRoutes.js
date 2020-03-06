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
			res.send('You are not logged in :(');
		}
		else
			next();
    });
    
    deleteRouter.route('/deleteList')
        .post( (req, res) =>{
            // required -> listId
            // resolve last accessed issue

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
                    res.send('Unauthorize access');
                }

                else{

                    //deleting list
                    let listTable = db.collection(listTableName);
                    await listTable.remove({"_id" : new ObjectId(listId)});

                    //removing listId from user personalList
                    await userTable.update({"username" : req.user.username},
                        {"$pull" : {"personalListIds" : listId}});

                    await connection.close();

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
                    await connection.close();
                    res.send('Unauthorize access');
                }

                //checking validity of taskId

                
            })();
        });
    
    deleteRouter.route('/deleteSubtask')
        .post( (req, res) =>{
            // required -> listId, taskId, subtaskName

        });
    return deleteRouter;
}

module.exports = router;


