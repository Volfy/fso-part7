/* eslint-disable no-underscore-dangle */
const router = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

router.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('user', {
    username: 1,
    name: 1,
  })
  res.json(blog)
})

router.post('/', userExtractor, async (req, res) => {
  const { body, user } = req

  if (body.title === undefined || body.url === undefined) {
    return res.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id,
  })

  const saved = await blog.save()
  user.blogs = user.blogs.concat(saved._id)
  await user.save()
  const returned = await saved.populate('user', { username: 1, name: 1 })

  return res.status(201).json(returned)
})

router.delete('/:id', userExtractor, async (req, res) => {
  const blogId = req.params.id
  const blog = await Blog.findById(blogId)
  const { user } = req

  if (!blog) {
    return res.status(204).end()
  }
  if (blog.user.toString() !== user.id.toString()) {
    return res.status(401).json({ error: 'blog not created by current user' })
  }
  await Blog.findByIdAndRemove(blogId)
  user.blogs = user.blogs.filter((b) => b.toString() !== blogId.toString())
  await user.save()

  return res.status(204).end()
})

router.put('/:id', async (req, res) => {
  const { body } = req
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.userId,
  }
  const updated = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
  })
  const returned = await updated.populate('user', { username: 1, name: 1 })
  return res.json(returned).end()
})

module.exports = router
