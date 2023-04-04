import axios from 'axios'

const baseUrl = '/api/blogs'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then((res) => res.data)
}

const addNew = async ({newBlog: blogObject, user}) => {
  const res = await axios.post(baseUrl, blogObject, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return res.data
}

const updateBlog = async (blogObject) => {
  const res = await axios.put(`${baseUrl}/${blogObject.id}`, blogObject)
  return res.data
}

const deleteBlog = async ({blogId, user}) => {
  const res = await axios.delete(`${baseUrl}/${blogId}`, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return blogId
}

export default {
  getAll,
  addNew,
  updateBlog,
  deleteBlog,
}
