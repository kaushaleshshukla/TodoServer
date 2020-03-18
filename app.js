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

app.use('/auth', authRouter);
app.use('/verifyMail', varifyRouter);
app.use('/profile', profileRouter);
app.use('/update', updateRouter);
app.use('/delete', deleteRouter);
app.use('/share', shareRouter);


app.get('/', (req, res) => {
	res.render(
		'index',
		{

		}
	);
});

app.listen(3000, () => {
	console.log("Listening On port 3000");
})