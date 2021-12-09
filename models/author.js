const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuthorSchema = new Schema({
	username: { required: true, type: String },
	password: { required: true, type: String },
})

const Author = mongoose.model('Author', AuthorSchema)

module.exports = Author
