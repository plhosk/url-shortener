
require('dotenv').config()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const url = require('url')
const express = require('express')
const app = express()

const mongoUri = process.env.MONGO_URI;

app.set('port', (process.env.PORT ||  5000))

app.get('*', (req, res) => {

})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
