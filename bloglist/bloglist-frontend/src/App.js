import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import LoginForm from './components/loginForm'
import BlogForm from './components/blogForm'
import Notif from './components/Notif'

import loginService from './services/login'
import blogService from './services/blogs'
import { useNotify } from './NotifContext'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useUserDispatch, useUserValue } from './UserContext'

const App = () => {
  const queryClient = useQueryClient()
  const user = useUserValue()
  const userDispatch = useUserDispatch()
  const messager = useNotify()

  // login stuff

  const handleLogin = async (credsObject) => {
    try {
      const rcvdUser = await loginService.login(credsObject)
      window.localStorage.setItem('LoggedInUser', JSON.stringify(rcvdUser))
      userDispatch({type: 'LOGIN', payload: rcvdUser})
      messager('', 0)
    } catch (e) {
      messager('Wrong Credentials', 1)
    }
  }

  /// login form auto hides, useRef unnecessary

  const loginForm = () => <LoginForm handleLogin={handleLogin} />

  const handleLogout = () => {
    window.localStorage.removeItem('LoggedInUser')
    userDispatch({type: 'LOGOUT'})
    messager('', 0)
  }

  // blog stuff

  const blogFormRef = useRef()

  const blogResult = useQuery(
    'blogs',
    blogService.getAll,
    {
      refetchOnWindowFocus: false,
    }
  )
  
  const newBlogMutation = useMutation(
    blogService.addNew,
    {
      onSuccess: (newBlog) => {
        const blogs = queryClient.getQueryData('blogs')
        queryClient.setQueryData('blogs', blogs.concat(newBlog))
        messager(`Blog ${newBlog.title} by ${newBlog.author} added`, 0)
      },
      onError: () => messager('Unable to add blog', 1)
    }
  )
  const updateBlogMutation = useMutation(
    blogService.updateBlog,
    {
      onSuccess: (updatedBlog) => {
        const blogs = queryClient.getQueryData('blogs')
        queryClient.setQueryData('blogs', blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b))
        messager(`Liked blog ${updatedBlog.title} by ${updatedBlog.author}`, 0)
      },
      onError: () => messager('Unable to like blog', 1)
    }
  )
  const deleteBlogMutation = useMutation(
    blogService.deleteBlog,
    {
      onSuccess: (deletedId) => {
        const blogs = queryClient.getQueryData('blogs')
        const deletedBlog = blogs.filter(b => b.id === deletedId)[0]
        queryClient.setQueryData('blogs', blogs.filter(b => b.id !== deletedId))
        messager(`Deleted blog ${deletedBlog.title} by ${deletedBlog.author}`, 0)
      },
      onError: () => messager('Unable to delete blog', 1)
    }
  )

  const addNewBlog = (newBlog) => {
    blogFormRef.current.toggleVisibility()
    newBlogMutation.mutate({newBlog, user})
  }
  const updateLikes = (blog) => {
    updateBlogMutation.mutate({...blog, likes: blog.likes + 1})
  }
  const deleteBlog = (blog) => {
    const blogId = blog.id
    deleteBlogMutation.mutate({blogId, user})
  }

  const blogDisplay = () => {
    if (blogResult.isLoading) {
      return <div>Blogs are loading...</div>
    }
    if (blogResult.isError) {
      return <div>Error getting blogs</div>
    }
    const blogs = blogResult.data
    return (
    <div className="bloglist">
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateLikes={updateLikes}
            user={user}
            deleteBlog={deleteBlog}
          />
        ))}
    </div>
  )}

  const blogForm = () => (
    <Togglable
      buttonLabel="add blog"
      idName="show-blog-form-btn"
      ref={blogFormRef}
    >
      <BlogForm addNewBlog={addNewBlog} messager={messager} />
    </Togglable>
  )

  // effects

  useEffect(() => {
    const loggedInUser = window.localStorage.getItem('LoggedInUser')
    if (loggedInUser) {
      userDispatch({type: 'LOGIN', payload: JSON.parse(loggedInUser)})
    }
  }, [userDispatch])

  // returns

  if (user === null) {
    return (
      <div>
        <h2>Log in to Application</h2>
        <Notif />
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <div>
        {user.name} logged in
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div>
        <h2>Create new blog</h2>
        <Notif />
        {blogForm()}
      </div>
      {blogDisplay()}
    </div>
  )
}

export default App
