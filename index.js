const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.static('dist'))

app.use(express.json())

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


let entry = 0

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
    entry++
    let info = `<p>Phonebook has info for ${entry} people</p> <p> ${Date()} </p>`
    response.send(info)
  })

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id == id)
  if (person) {
      response.json(person)
  } else {
      response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  let person = request.body
  person.id = String(Math.floor((Math.random() * 10000)+1))
  if (!person.name){
    return response.status(404).json({ error: 'name is missing' })
  }
  if (!person.number){
    return response.status(404).json({ error: 'number is missing' })
  }
  if (persons.some(personil => personil.name === person.name)) {
    return response.status(404).json({ error: 'name must be unique' })
  }
  persons = persons.concat(person)
  response.json(person)
  
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})