import { useQuery, useMutation } from '@apollo/client'
import { ALL_BOOKS} from '../queries'
import { useState } from 'react'

const Books = ({show}) => {

  const books = useQuery(ALL_BOOKS)

  if (books.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
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
    </div>
  )
}

export default Books
