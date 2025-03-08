const blogsRouter = require('express').Router()

const Blog = require('../models/blog')

blogsRouter.get('/', async (_request, response) => {
  response.json(await Blog.find())
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  response.status(201).json(await blog.save())
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
