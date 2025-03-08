const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are six blogs', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, (await helper.blogsInDb()).length)
})

test('blogs contain id and not _id property', async () => {
  await api.get('/api/blogs')
    .expect(200)
    .expect((res) => {
      for (const blog of res.body) {
        assert.strictEqual(blog._id, undefined)
        if ('_id' in blog) throw new Error('_id property found')
      }
    })
})

after(async () => {
  await mongoose.connection.close()
})
