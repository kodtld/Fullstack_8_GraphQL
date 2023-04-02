const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

console.log('Connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Could not connect to MongoDB:', error.message)
  })


const typeDefs = `
  type Book {
    title: String!
    published: String
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre:String): [Book!]
    allAuthors: [Author!]
    me: User
    recommendedBooks(genre: String!): [Book!]!
  }
  
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favouriteGenre: String!
      ): User
      login(
      username: String!
      password: String!
      ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author')
      if (!args.author && !args.genre) {
        console.log(books)
        return books
      }
      if (args.genre && !args.author) {
        return books.filter((book) => book.genres.includes(args.genre))

      }
      if (!args.genre && args.author) {
        const authorbooks = books.filter((book) => book.author === args.author)
        return authorbooks
      }
      else {
        return books
          .filter((book) => {
            return book.author === args.author
          })
          .filter((book) => book.genres.includes(args.genres))
      }
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      return authors
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'autoauto') {
        throw new UserInputError("Wrong username or password")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

    addBook: async (root, args, context) => {
      console.log(args.author)
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Unauthenticated")
      }
      if (!author) {
        author = new Author({ name: args.author, bookCount: 1, born: null })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        author.bookCount++
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
  
      const book = new Book({ ...args, author: author.id })
      try {
        await book.save()
      }
      catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return book
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Unauthenticated")
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})