import { useState } from "react";
import PropTypes from "prop-types";

const Blog = ({ blog, updateLikes, user, deleteBlog }) => {
  const [isFullView, setFullView] = useState(false);
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const blogSmall = (
    <div style={blogStyle} className="blog">
      {blog.title} by {blog.author}
      <button onClick={() => setFullView(!isFullView)}>View</button>
    </div>
  );

  const blogBig = (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} by {blog.author}
        <button onClick={() => setFullView(!isFullView)}>Hide</button>
      </div>
      <div>{blog.url}</div>
      <div>
        {blog.likes} likes
        <button onClick={() => updateLikes(blog)}>Like</button>
      </div>
      <div>{blog.user.username}</div>
      {blog.user.id === user.id && (
        <button
          onClick={() => {
            // eslint-disable-next-line no-alert
            if (
              window.confirm(
                `Do you want to delete ${blog.title} by ${blog.author}?`
              )
            ) {
              deleteBlog(blog, user);
            }
          }}
        >
          Remove
        </button>
      )}
    </div>
  );

  return isFullView ? blogBig : blogSmall;
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateLikes: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
};

export default Blog;
