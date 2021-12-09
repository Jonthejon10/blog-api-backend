const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
require('dotenv').config()

const app = express();

//Set up mongoose connection
var mongoose = require('mongoose')
var mongoDB = process.env.DATABASE_URL
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const Author = require('./models/author')

passport.use(
	new LocalStrategy((username, password, done) => {
		Author.findOne({ username: username }, (err, author) => {
			if (err) {
				return done(err)
			}
			if (!author) {
				return done(null, false, { message: 'Incorrect username' })
			}
			if (author.password !== password) {
				bcrypt.compare(password, author.password, (err, res) => {
					if (res) {
						// passwords match! log author in
						return done(null, author)
					} else {
						// passwords do not match!
						return done(null, false, {
							message: 'Incorrect password',
						})
					}
				})
			}
			return done(null, author)
		})
	})
)

passport.serializeUser(function (author, done) {
	done(null, author.id)
})

passport.deserializeUser(function (id, done) {
	Author.findById(id, function (err, author) {
		done(err, author)
	})
})

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))

app.use(function (req, res, next) {
	res.locals.author = req.author
	next()
})

const apiRouter = require('./routes/api')
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
