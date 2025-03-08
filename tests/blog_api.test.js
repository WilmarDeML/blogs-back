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

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'Test title',
    author: 'Test author',
    url: 'https://test.com',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  assert(titles.includes('Test title'))
})

test('property likes is zero when not provided', async () => {
  const newBlog = {
    title: 'Test title',
    author: 'Test author',
    url: 'https://test.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    .expect((res) => {
      assert.strictEqual(res.body.likes, 0)
    })
})

after(async () => {
  await mongoose.connection.close()
})
