const blogsRouter = require('express').Router()

const { userExtractor } = require('../utils/middleware')

const Blog = require('../models/blog')

blogsRouter.get('/', async (_request, response) => {
  response.json(await Blog.find().populate('user', { password: 0, blogs: 0 }))
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user
  const blog = new Blog({ ...request.body, user: user.id })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const foundBlog = await Blog.findById(request.params.id)

  if (!foundBlog) {
    response.statusMessage = 'Blog not found'
    return response.status(404).end()
  }

  const user = request.user

  if (user.id.toString() !== foundBlog.user.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }

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
