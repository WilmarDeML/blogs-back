const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (_request, response) => {
  response.json(await Blog.find().populate('user', { password: 0, blogs: 0 }))
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = new Blog({ ...request.body, user: user.id })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const newBlog = req.body

  const updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, { new: true, runValidators: true, context: 'query' })

  if (!updatedBlog) {
    res.statusMessage = 'Blog not found'
    return res.status(404).end()
  }

  res.json(updatedBlog)
})

module.exports = blogsRouter
