const countBy = require('lodash.countby')

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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
