const Comment = require('../models/comment')
const Post = require('../models/post')
const { body, validationResult } = require('express-validator')
const async = require('async')

// COMMENT CREATE
exports.comment_create = [
	//  Validation and sanitization of data
	body('author', 'Author name cannot be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('text', 'Text cannot be empty.').trim().isLength({ min: 1 }).escape(),

	// Process request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req)

        const comment = new Comment({
            author: req.body.author,
            timestamp: new Date(),
            text: req.body.text
		})
		if (!errors.isEmpty()) {
			res.json({
				data: req.body,
				errors: errors.array(),
			})
			return
		} else {
			// Data valid, save comment.
			comment.save((err) => {
				if (err) {
					return next(err)
				}
			})
			Post.findByIdAndUpdate(req.body.reference, { $push: {comments: comment} }, {}, (err) => {
				if(err) {
					return next(err)
				}
			})
		}
    }
]

// GET ALL COMMENTS
exports.comments_get = async (req, res, next) => {
	try {
		const comments = await Comment.find({})
		if (!comments) {
			return res.status(404).json({ err: 'Comments not found' })
		}
		res.status(200).json({ comments })
	} catch (err) {
		next(err)
	}
}

// DELETE COMMENT
exports.comment_delete = async (req, res, next) => {
    async.parallel(
		{
			comment: (callback) => {
				Comment.findById(req.body.id).exec(callback)
			},
		},
		async (err, results) => {
			if (err) {
				return next(err)
			}
			
			// Deleting from comment collection
			Comment.findByIdAndRemove(
				req.body.id,
				function deleteComment(err) {
					if (err) {
						return next(err)
					}
				}
			)

			// Deleting comment from post object
			const parentPost = await Post.findOne({ _id: req.body.post_id })
			await parentPost.comments.pull({ _id: req.body.id })
			await parentPost.save()
		}
	)
}