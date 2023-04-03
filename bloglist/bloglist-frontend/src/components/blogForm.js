import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ addNewBlog, messager }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  const addBlog = (e) => {
    e.preventDefault()
    if (newBlog.title && newBlog.url && newBlog.author) {
      addNewBlog(newBlog)
      setNewBlog({ title: '', author: '', url: '' })
    } else {
      messager('Missing fields', 1)
    }
  }

  return (
    <form onSubmit={addBlog}>
      <div>
        <label htmlFor="title">title:</label>
        <input
          id="title"
          type="text"
          value={newBlog.title}
          name="Title"
          onChange={({ target }) =>
            setNewBlog({ ...newBlog, title: target.value })
          }
        />
      </div>
      <div>
        <label htmlFor="author">author:</label>
        <input
          id="author"
          type="text"
          value={newBlog.author}
          name="Author"
          onChange={({ target }) =>
            setNewBlog({ ...newBlog, author: target.value })
          }
        />
      </div>
      <div>
        <label htmlFor="url">url:</label>
        <input
          id="url"
          type="text"
          value={newBlog.url}
          name="URL"
          onChange={({ target }) =>
            setNewBlog({ ...newBlog, url: target.value })
          }
        />
      </div>
      <button type="submit" id="create-blog-btn">
        Create
      </button>
    </form>
  )
}

BlogForm.propTypes = {
  addNewBlog: PropTypes.func.isRequired,
  messager: PropTypes.func.isRequired,
}

export default BlogForm
