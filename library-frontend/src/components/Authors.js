import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR} from '../queries'
import { useState } from 'react'

const Authors = ({show}) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const authors = useQuery(ALL_AUTHORS)
  console.log(authors.data)

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      if (error.graphQLErrors[0]) {
        console.log(error.graphQLErrors[0].message)
      }
    }
  })

  if (authors.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }

  const submit = (event) => {
    event.preventDefault()
    console.log(name)
    console.log(born)

    if (born !== '') { // Check if born is not null before executing the mutation
      editAuthor({
        variables: { name: name, setBornTo: Number(born) } // Change type of born to number
      })
      setBorn('')
      setName('')
    }
  }
  
  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Born:</th>
            <th>Book count:</th>
            </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          Author:
          <select value={name} onChange={({ target }) => setName(target.value)}>
          <option value=""></option>
            {authors.data.allAuthors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <div>
            Born:
            <input
              value={born} onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type="submit">Update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
