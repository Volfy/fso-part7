import { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import Togglable from "./components/Togglable";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Notif from "./components/Notif";

import loginService from "./services/login";
import blogService from "./services/blogs";

const App = () => {
  const [isError, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);

  // message helper function

  const messager = (msg, isErrorVal) => {
    setMessage(msg);
    setError(isErrorVal);
    setTimeout(() => setMessage(""), 5000);
  };

  // login stuff

  const handleLogin = async (credsObject) => {
    try {
      const rcvdUser = await loginService.login(credsObject);
      window.localStorage.setItem("LoggedInUser", JSON.stringify(rcvdUser));
      setUser(rcvdUser);
      messager("", 0);
    } catch (e) {
      messager("Wrong Credentials", 1);
    }
  };

  /// login form auto hides, useRef unnecessary

  const loginForm = () => <LoginForm handleLogin={handleLogin} />;

  const handleLogout = () => {
    window.localStorage.removeItem("LoggedInUser");
    setUser(null);
    messager("", 0);
  };

  // blog stuff

  const blogFormRef = useRef();

  const addNewBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility();
    try {
      const blog = await blogService.addNew(blogObject, user);
      setBlogs(
        blogs.concat({
          ...blogObject,
          user: blog.user,
          likes: blog.likes,
          id: blog.id,
        })
      );
      messager(`Blog ${blog.title} by ${blog.author} added`, 0);
    } catch (e) {
      messager("Unable to add new blog", 1);
    }
  };

  const updateLikes = async (blogObject) => {
    const { user: _, ...blogToUpdate } = {
      ...blogObject,
      userId: blogObject.user.id,
      likes: blogObject.likes + 1,
    };

    try {
      const blog = await blogService.updateBlog(blogToUpdate);
      setBlogs(blogs.map((b) => (b.id === blogObject.id ? blog : b)));
      messager(`Liked ${blog.title} by ${blog.author}`, 0);
    } catch (e) {
      messager("Unable to like blog", 1);
    }
  };

  const deleteBlog = async (blog, passedUser) => {
    try {
      await blogService.deleteBlog(blog.id, passedUser);
      setBlogs(blogs.filter((b) => b.id !== blog.id));
      messager(`Deleted ${blog.title} by ${blog.author}`);
    } catch (e) {
      messager("Unable to delete blog", 1);
    }
  };

  const blogForm = () => (
    <Togglable
      buttonLabel="add blog"
      idName="show-blog-form-btn"
      ref={blogFormRef}
    >
      <BlogForm addNewBlog={addNewBlog} messager={messager} />
    </Togglable>
  );

  const blogDisplay = (passedBlogs) => (
    <div className="bloglist">
      {passedBlogs
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
  );

  // effects

  useEffect(() => {
    const loggedInUser = window.localStorage.getItem("LoggedInUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  /// should this be done only after login?
  useEffect(() => {
    blogService.getAll().then((rcvdBlogs) => setBlogs(rcvdBlogs));
  }, []);

  // returns

  if (user === null) {
    return (
      <div>
        <h2>Log in to Application</h2>
        <Notif message={message} isError={isError} />
        {loginForm()}
      </div>
    );
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
        <Notif message={message} isError={isError} />
        {blogForm()}
      </div>
      {blogDisplay(blogs)}
    </div>
  );
};

export default App;
