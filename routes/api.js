const express = require('express')
const router = express.Router()

const post_controller = require('../controllers/postController')
const comment_controller = require('../controllers/commentController')
const author_controller = require('../controllers/authorController')

router.get('/', (req, res, next) => {
	res.redirect('/posts')
})

// Create post
router.post('/posts', post_controller.post_create)

// Request to delete post
router.delete('/posts/:id/delete', post_controller.post_delete)

// Request to update post
router.put('/posts/:id/update', post_controller.post_update)

// Single post
router.get('/posts/:id', post_controller.single_post)

// All posts
router.get('/posts', post_controller.posts_get)


// Create post comment
router.post('/posts/:postid/comments', comment_controller.comment_create)

// Delete post comment
router.delete('/posts/:postid/comments/:commentid')

// Get all post comments
router.get('/posts/:postid/comments', comment_controller.comments_get)


// Create author
router.post("/sign-up", author_controller.sign_up);

// Login
router.post("/login", author_controller.log_in);

// Logout
router.get("/logout", author_controller.log_out);

module.exports = router