import { useQuery, useMutation } from '@apollo/client'
import { ALL_BOOKS} from '../queries'
import { useState } from 'react'

const Books = ({show}) => {

  const [genre, setGenre] = useState("")

  let books = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
  })

  if (books.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }
  
  const Klassikko = () => {
    setGenre("Klassikko")
    console.log(books)
  }

  const Database = () => {
    setGenre("database")
  }

  const All = () => {
    setGenre("")
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={Klassikko}>Klassikko</button>
      <button onClick={Database}>Database</button>
      <button onClick={All}>All</button>
    </div>
  )
}

export default Books
