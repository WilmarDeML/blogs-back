const dummy = (blogs) => 1

const totalLikes = blogs => blogs.reduce((acc, blog) => acc + blog.likes, 0)

const favoriteBlog = blogs => blogs.reduce((ant, act) => {
  const { title, author, likes } = ant.likes > act.likes ? ant : act
  return { title, author, likes }
}, {})

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
