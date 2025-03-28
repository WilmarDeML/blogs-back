const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

const User = require('../models/user')
const { SECRET } = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })

  const passwordCorrect = user ? await bcrypt.compare(password, user.password) : false

  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = { username, id: user.id }

  const token = jwt.sign(userForToken, SECRET)

  response
    .status(200)
    .send({ token, username, name: user.name })
})

module.exports = loginRouter
