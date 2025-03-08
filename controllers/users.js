const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  response.json(await User.find())
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({ username, password: passwordHash, name })

  response.status(201).json(await user.save())
})

module.exports = usersRouter
