const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjs = helper.initialBlogs.map((b) => new Blog(b))
  const promiseArr = blogObjs.map((b) => b.save())
  await Promise.all(promiseArr)
})

describe('when there are already some blogs', () => {
  test('all blogs are returned', async () => {
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs have unique identifier property named id', async () => {
    const res = await api
      .get('/api/blogs')
    expect(res.body[0].id).toBeDefined()
  })

  test('a blog is returned when valid id is given', async () => {
    const blogs = await helper.blogsInDb()
    const validId = blogs[0].id
    const res = await api
      .get(`/api/blogs/${validId}`)
      .expect(200)

    expect(res.body).toEqual(blogs[0])
  })

  test('fails with 400 if id is invalid', async () => {
    const invalidId = 1000
    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  test('fails with 404 if blog is missing', async () => {
    const missingId = helper.nonExistingId
    await api
      .get(`/api/blogs/${missingId}`)
      .expect(404)
  })
})

describe('addition of a new blog', () => {
  test('valid blog can be added', async () => {
    const newBlog = {
      title: 'Dumb sentence for a title',
      author: 'John Doe',
      url: 'xyz.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const res = await api.get('/api/blogs')

    expect(res.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(res.body.map((r) => r.title)).toContain('Dumb sentence for a title')
  })

  test('likes default to 0 if not provided', async () => {
    const newBlog = {
      title: 'Dumb sentence for a title',
      author: 'John Doe',
      url: 'xyz.com',
    }

    const res = await api
      .post('/api/blogs')
      .send(newBlog)

    expect(res.body.likes).toEqual(0)
  })

  test('fails to post w/ code 400 if title is missing', async () => {
    const newBlog = {
      author: 'John Doe',
      url: 'xyz.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const res = await api.get('/api/blogs')
    expect(res.body).toHaveLength(helper.initialBlogs.length)
  })

  test('fails to post w/ code 400 if url is missing', async () => {
    const newBlog = {
      title: 'Dumb title',
      author: 'John Doe',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const res = await api.get('/api/blogs')
    expect(res.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with code 204 if id is valid', async () => {
    const blogs = await helper.blogsInDb()
    const blogToDelete = blogs[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const res = await api.get('/api/blogs')
    expect(res.body).not.toContain(blogToDelete.title)
  })

  test('fails with code 400 if id is invalid', async () => {
    const invalidId = '1000'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)

    const res = await api.get('/api/blogs')
    expect(res.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('update of a blog', () => {
  test('updates blog with code 200 if id is valid', async () => {
    const blogs = await helper.blogsInDb()
    const blogToUpdate = {
      title: blogs[0].title,
      author: blogs[0].author,
      url: blogs[0].url,
      likes: 2000,
      id: blogs[0].id,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const res = await api.get(`/api/blogs/${blogs[0].id}`)
    expect(res.body.likes).toEqual(2000)
  })

  test('fails with code 400 if id is invalid', async () => {
    const blogs = await helper.blogsInDb()
    const blogToUpdate = {
      title: 'fake',
      author: 'fake',
      url: 'fake',
      likes: 2000,
      id: 1000,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(400)

    const res = await api.get(`/api/blogs/${blogs[0].id}`)
    expect(res.body.likes).not.toEqual(2000)
  })
  test('fails with code 404 if id is nonexistent', async () => {
    const blogs = await helper.blogsInDb()
    const blogToUpdate = {
      title: 'fake',
      author: 'fake',
      url: 'fake',
      likes: 2000,
      id: helper.nonExistingId,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(404)

    const res = await api.get(`/api/blogs/${blogs[0].id}`)
    expect(res.body.likes).not.toEqual(2000)
  })
})

describe('user stuff', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('not', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('getting users succeeds', async () => {
    const res = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toHaveLength(1)
  })

  test('posting user with unique username succeeds', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      username: 'notroot',
      password: 'pass',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(userToAdd.username)
  })
  test('posting user with nonunique username fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      username: 'root',
      password: 'pass',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('posting user with no username fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      // username: 'root',
      password: 'pass',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('posting user with no password fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      username: 'root',
      // password: 'pass',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('posting user with < 3 char username fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      username: 'ro',
      password: 'pass',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('posting user with < 3 char password fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToAdd = {
      username: 'root',
      password: 'pa',
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
