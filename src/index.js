require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('../models/person')
app.use(express.static('dist'))

morgan.token('person', function (req, res) {
  return JSON.stringify(req.body) 
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

const cors = require('cors')
app.use(cors())
app.use(express.json())

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', function(request, response) {
  response.send(`<p>Phonebook has info</p>`)
})

app.get('/info', (request, response) => {
  Person.find({}).then(people => {
    response.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date().toString()}</p>`)
  })
})

app.get('/api/people', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.post('/api/people', (request, response, next) => {
  const { firstName, lastName, date } = request.body
  if (firstName === undefined || lastName === undefined || date === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  const person = new Person({
    firstName: firstName,
    lastName: lastName,
    date: date
  })
  let error = person.validateSync()
  person
  .save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

app.get('/api/people/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/people/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/people/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(
    request.params.id, 
    { firstName, lastName, date },
    { new: true, runValidators: true, context: 'query' }
  )
  let error = request.data.validateSync()
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.firstName === 'CastError' || error.lastName === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.firstName === 'ValidationError' || error.lastName === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const filterName = (people, firstName, lastName) => {
  const person = people.find(person => person.firstName === firstName && person.lastName === lastName)
  if (person) {
    return true
  }else{
    return false
  }
}