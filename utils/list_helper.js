const countBy = require('lodash.countby')
const groupBy = require('lodash.groupby')

const dummy = (blogs) => 1

const totalLikes = blogs => blogs.reduce((acc, blog) => acc + blog.likes, 0)

const favoriteBlog = blogs => blogs.reduce((ant, act) => {
  const { title, author, likes } = ant.likes > act.likes ? ant : act
  return { title, author, likes }
}, {})

const mostBlogs = blogs => {
  const count = countBy(blogs, 'author')
  return Object.entries(count).reduce((acc, [author, blogsCount]) => {
    return acc.blogs > blogsCount ? acc : { author, blogs: blogsCount }
  }, {})
}

const mostLikes = blogs => {
  const groups = groupBy(blogs, 'author')
  return Object.entries(groups).reduce((acc, [author, blogs]) => {
    const countLikes = blogs.reduce((acc, blog) => acc + blog.likes, 0)
    return acc.likes > countLikes ? acc : { author, likes: countLikes }
  }, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
