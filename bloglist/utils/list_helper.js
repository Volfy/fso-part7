const _ = require("lodash");
// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const reducer = (sum, item) => sum + item.likes;

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const maxLikes = blogs.reduce(
    (sum, item) => (sum > item.likes ? sum : item.likes),
    0
  );
  const faves = blogs.find((b) => b.likes === maxLikes);

  return {
    title: faves.title || faves[0].title,
    author: faves.author || faves[0].author,
    url: faves.url || faves[0].url,
  };
};

const mostBlogs = (blogs) => {
  // using lodash
  if (blogs.length === 0) return null;

  const authors = _.countBy(blogs, "author");

  // rearrange authors list to include author as property
  // find the maximum by blogs
  return _.maxBy(
    _.map(Object.keys(authors), (val) => ({
      author: val,
      blogs: authors[val],
    })),
    "blogs"
  );
};

const mostLikes = (blogs) => {
  // using lodash
  if (blogs.length === 0) return null;

  const grouped = _.groupBy(blogs, "author");

  // calculate total likes for each author
  // rearrange to include author as property
  // find the maximum by likes
  return _.maxBy(
    _.map(Object.keys(grouped), (val) => ({
      author: val,
      likes: totalLikes(grouped[val]),
    })),
    "likes"
  );
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
