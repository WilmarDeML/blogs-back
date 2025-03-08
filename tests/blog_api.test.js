const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
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

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, (await helper.blogsInDb()).length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)
    assert(titles.includes('Canonical string reduction'))
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

  describe('adition of a new blog', () => {
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

    test('code 400 is returned when title or url is not provided', async () => {
      const newBlog = {
        author: 'Test author'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updation of a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const newBlog = {
        title: 'New title',
        author: 'New author',
        url: 'https://new.com',
        likes: 2
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

      const titles = blogsAtEnd.map(r => r.title)
      assert(titles.includes('New title'))
    })

    test('total likes are updated', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const totalLikesBefore = blogsAtStart.reduce((acc, blog) => acc + blog.likes, 0) - blogToUpdate.likes

      const newBlog = {
        likes: 1000
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      const totalLikesAfter = blogsAtEnd.reduce((acc, blog) => acc + blog.likes, 0) - newBlog.likes

      assert.strictEqual(totalLikesAfter, totalLikesBefore)
    })

    test('fails with status code 404 if id is not valid', async () => {
      const invalidId = '5a3d5da59070081a82a34450'

      const newBlog = {
        title: 'New title',
        author: 'New author',
        url: 'https://new.com',
        likes: 2
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(newBlog)
        .expect(404)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
