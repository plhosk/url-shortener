'use strict'
require('dotenv').config()
const validUrl = require('valid-url')
const fs = require('fs')
const marked = require('marked')
const mongo = require('mongodb').MongoClient
const url = require('url')
const express = require('express')
const app = express()

const mongoUri = process.env.MONGO_URI;
const collection = 'url-shortener'

app.set('port', (process.env.PORT ||  5000))

// Send README.md
app.get('/', (req, res) => {
  fs.readFile('./README.md', 'utf8', (err, data) => {
    if (err) {
      console.log(err)
    }
    res.send(marked(data))
  })
})

// Forward to URL
app.get(/^\/\d*\/?$/, (req, res) => {
  let str = req.url.slice(1)
  mongo.connect(mongoUri, (err, db) => {
    if (err) throw err
    db.collection(collection).find({ number: +str })
      .toArray((err, result) => {
        if (result.length == 0) {
          res.send({ error: str + ' was not found in the database.' })
        } else {
          res.redirect(result[0].url)
        }
        db.close()
    })
  })
})

// Add URL to database, return JSON with shortened URL
app.get('/*', (req, res) => {
  let str = req.url.slice(1)

  // check URL validity
  if (!validUrl.isUri(str)) {
    res.send({error: str + ' is not a valid URL.'})
    return
  }
  const parsed = url.parse(str).format()

  mongo.connect(mongoUri, (err, db) => {
    if (err) throw err
    db.collection(collection).find({}, { number: 1, _id: 0 })
      .toArray((err, results) => {
        // Generate number and check if unique
        let newNumber;
        do {
          newNumber = Math.floor(Math.random() * 9000 + 1000)
        } while (results.find((ele) => {
          return ele.number == newNumber
        }) != undefined)

        db.collection(collection).insert({
          number: newNumber,
          url: parsed
        }, (err) => {
          if (err) throw err
          res.send({
            shortened: process.env.HEROKU_URL + '/' + newNumber,
            original: parsed
          })
          db.close()
        })
    })
  })

})
 




app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
