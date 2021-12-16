require('dotenv').config()

const Author = require('../models/author')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const jwt = require('jsonwebtoken')

// SIGN UP
exports.sign_up = [
	// Validation and sanitization of fields
	body('username', 'Username cannot be empty !')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('password', 'Password must be at least 4 characters long !')
		.trim()
		.isLength({ min: 4 })
		.escape(),
	body('password_confirmation')
		.notEmpty()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error(
					'Password confirmation field must have the same value as the password field'
				)
			}
			return true
		}),

	(req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			res.json({
				data: req.body,
				errors: errors.array(),
            })
            return
		}

		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
			if (err) {
				return next(err)
			}
			const author = new Author({
				username: req.body.username,
				password: hashedPassword,
			}).save((err) => {
				if (err) {
					return next(err)
				}
			})
			res.redirect('/login')
		})
	},
]


exports.log_in = (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err || !user) {
			const error = new Error('An error occurred.')

			return next(error)
		}

		req.login(user, (error) => {
			if (error) return next(error)

			const username = user.username
			const signedUser = { name: username }
			
			const token = jwt.sign(signedUser, process.env.SECRET)
			
			return res.json({token: token, status: 'success'})
		})
	})(req, res, next)
}

exports.authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, process.env.SECRET, (err, user) => {
		if (err) return res.sendStatus(403)

		req.user = user
		next()
	})
}

exports.log_out = (req, res, next) => {
	req.logout()
	res.redirect('/')
}
