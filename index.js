require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))

app.use(express.json())

morgan.token('type', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

// let persons = [
//   {
//     'id': '1',
//     'name': 'Arto Hellas',
//     'number': '040-123456'
//   },
//   {
//     'id': '2',
//     'name': 'Ada Lovelace',
//     'number': '39-44-5323523'
//   },
//   {
//     'id': '3',
//     'name': 'Dan Abramov',
//     'number': '12-43-234345'
//   },
//   {
//     'id': '4',
//     'name': 'Mary Poppendieck',
//     'number': '39-23-6423122'
//   }
// ]


let entry = 0

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  entry++
  let info = `<p>Phonebook has info for ${entry} people</p> <p> ${Date()} </p>`
  response.send(info)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if(!person){
        response.status(404).end()
      }

      response.json(person)
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name:body.name,
    number:body.number,
  })
  if (!person.name){
    return response.status(404).json({ error: 'name is missing' })
  }
  if (!person.number){
    return response.status(404).json({ error: 'number is missing' })
  }
  // if (persons.some(personil => personil.name === person.name)) {
  //   return response.status(404).json({ error: 'name must be unique' })
  // }
  person.save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => {
      next(error)
    })


})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findById(request.params.id)
    .then((person) => {
      if(!person){
        response.status(404).end()
      }

      person.name = name
      person.number = number

      person.save().then((savedPerson) => {
        response.json(savedPerson)
      })
    })
    .catch((error) => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})