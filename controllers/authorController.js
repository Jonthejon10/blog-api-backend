const Author = require('../models/author')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const passport = require('passport')

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
	body('password-confirmation')
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

exports.log_in = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/log-in',
})

exports.log_out = (req, res, next) => {
	req.logout()
	res.redirect('/')
}
