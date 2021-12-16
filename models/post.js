const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
	author: { required: true, type: String },
	timestamp: { required: true, type: Date },
	title: { required: true, type: String, minLength: 1 },
	text: { required: true, type: String, minLength: 1},
	comments: [
		{ type: Schema.Types.ObjectId, ref: 'Comments', required: true },
    ],
    visible: {required: true, type: Boolean}
})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
