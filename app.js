const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.set('views', path.join(__dirname + '/src/views'));
app.set('view engine', 'ejs');

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

app.use('/auth', authRouter);
app.use('/verifyMail', varifyRouter);
app.use('/profile', profileRouter);
app.use('/update', updateRouter);

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