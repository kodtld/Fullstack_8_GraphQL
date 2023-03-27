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

    const bornInt = parseInt(born)
    editAuthor({
      variables: { name, setBornTo: bornInt }
    })
    console.log('edit author...')
    console.log('name:', name, ', born:', bornInt);
    setBorn('')
    setName('')
  }
  
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
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
            {authors.data.allAuthors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <div>
            Born:
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type="submit">Update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
