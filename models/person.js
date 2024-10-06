const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 3,
    required: true
  },
  lastName: {
    type: String,
    minlength: 3,
    required: true
  },
  date: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2}.\d{2}.\d{4}/.test(v);
      }
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)