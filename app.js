const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.set('views', path.join(__dirname + '/src/views'));
app.set('view engine', 'ejs');

let corsOptions = {
	origin : ['http://localhost:3000', 'http://localhost:3001', 'http://40.121.182.221:9000'],
	credentials : true
};
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'TODO'}));
require('./src/config/passport')(app);

//Routes of application
const authRouter = require('./src/routes/authRoutes')();
const varifyRouter = require('./src/routes/verifyMail')();
const profileRouter = require('./src/routes/profileRoutes')();
const updateRouter = require('./src/routes/updateRoutes')();
const deleteRouter = require('./src/routes/deleteRoutes')();
const shareRouter = require('./src/routes/shareRoutes')();

app.use('/api/auth', authRouter);
app.use('/api/verifyMail', varifyRouter);
app.use('/api/profile', profileRouter);
app.use('/api/update', updateRouter);
app.use('/api/delete', deleteRouter);
app.use('/api/share', shareRouter);


app.get('*', (req, res) => {
	res.statusCode = 404;
	res.statusMessage = "Page Not Found";
	res.send("Page not found");
});

app.listen(9000, () => {
	console.log("Listening On port 9000");
})