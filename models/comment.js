const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
	author: { required: true, type: String },
	timestamp: { required: true, type: Date },
	text: { required: true, type: String, minLength: 1 },
})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment 
