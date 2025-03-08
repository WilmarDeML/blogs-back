const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  response.json(await User.find())
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  if (!password) return response.status(400).json({ error: 'Path `password` is required' })
  if (password.length < 3) return response.status(400).json({ error: '`password` is shorter than the minimum allowed length (3)' })

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({ username, password: passwordHash, name })

  response.status(201).json(await user.save())
})

module.exports = usersRouter
