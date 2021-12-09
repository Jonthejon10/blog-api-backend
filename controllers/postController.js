const Post = require('../models/post')
const { body, validationResult } = require('express-validator')
const async = require('async')

// POST CREATE
exports.post_create = [
	// Making sure comments are an array
	(req, res, next) => {
		if (!(req.body.comments instanceof Array)) {
			if (typeof req.body.comments === 'undefined') {
				req.body.comments = []
			} else {
				req.body.comments = new Array(req.body.comments)
			}
		}
		next()
	},

	//  Validation and sanitization of data
	body('title', 'Title cannot be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('text', 'Text must not be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization
	(req, res, next) => {
		const errors = validationResult(req)

		const post = new Post({
			author: req.body.author,
			timestamp: new Date(),
			title: req.body.title,
			text: req.body.text,
			comments: [],
			visible: true,
		})

		if (!errors.isEmpty()) {
			res.json({
				data: req.body,
				errors: errors.array(),
			})
			return
		} else {
			// Data valid, save post.
			post.save((err) => {
				if (err) {
					return next(err)
				}

				// Success
				res.redirect('/posts')
			})
		}
	},
]

// GET ALL POSTS
exports.posts_get = async (req, res, next) => {
	try {
		const posts = await Post.find({})
		if (!posts) {
			return res.status(404).json({ err: 'posts not found' })
		}
		res.status(200).json({ posts })
	} catch (err) {
		next(err)
	}
}


// GET SINGLE POST
exports.single_post = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) {
			return res
				.status(404)
				.json({ err: `Post with id ${req.params.id} not found` })
		}
		res.status(200).json({ post })
	} catch (err) {
		next(err)
	}
}

// UPDATE POST
exports.post_update = [

	// Validate and sanitise data.
	body('title', 'Title cannot be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('text', 'Text must not be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req)

		const post = new Post({
			author: req.body.author,
			timestamp: new Date(),
			title: req.body.title,
			text: req.body.text,
			comments: [],
			visible: true,
		})

		if (!errors.isEmpty()) {
			res.json({
				data: req.body,
				errors: errors.array(),
			})
			return
		} else {
			// Data from form is valid. Update the record.
			Post.findByIdAndUpdate(
				req.params.id,
				post,
				{},
				function (err) {
					if (err) {
						return next(err)
					}
					// Successful - redirect to game detail page.
					res.redirect('/posts')
				}
			)
		}
	},
]

// DELETE POST
exports.post_delete = (req, res, next) => {
    async.parallel(
		{
			post: (callback) => {
				Post.findById(req.params.id).exec(callback)
			},
		},
		(err, results) => {
			if (err) {
				return next(err)
			}
			Post.findByIdAndRemove(req.body.postid, function deletePost(err) {
				if (err) {
					return next(err)
				}
				res.redirect('/posts')
			})
		}
	)
}