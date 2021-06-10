const twitter = require('express').Router()
const express = require('express')
twitter.use(express.urlencoded({ extended: false }))
const client = require('../client.js')
const path = require('path');

twitter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../documentation.html'))
})


twitter.get('/users', (req, res) => {
    client.query(`SELECT id, picture, name, email FROM users`)
    .then(data => res.json(data.rows))
})

twitter.get('/users/:id', (req, res) => {
    let {id} = req.params
    client.query(`SELECT id, picture, name, email FROM users WHERE id=${id}`)
    .then(data => res.json(data.rows))
})

twitter.get('/users/:user/messages', (req, res) => {
    let {user} = req.params
    client.query(`SELECT text, time, picture, name, email, users.id FROM messages RIGHT JOIN users ON users.id=users_id WHERE users_id=${user} ORDER BY time ASC`)
    .then(data => res.json(data.rows))
})

twitter.post('/users', (req, res) => {
    const {picture, name, email, password} = req.body
    client.query(`INSERT INTO users (picture, name, email, password) VALUES('${picture}', '${name}', '${email}', '${password}') RETURNING *`)
    .then(data => res.json(data.rows))
})

twitter.get('/messages', (req, res) => {
    client.query(`SELECT * FROM messages ORDER BY time ASC`)
    .then(data => res.json(data.rows))
})

twitter.get('/messages/:id', (req, res) => {
    let {id} = req.params
    client.query(`SELECT * FROM messages WHERE id=${id}`)
    .then(data => res.json(data.rows))
})

twitter.post('/messages', (req, res) => {
    const {text, users_id} = req.body
    client.query(`INSERT INTO messages (text, users_id) VALUES('${text}', '${users_id}') RETURNING *`)
    .then(data => res.json(data.rows))
})

twitter.get('/me', (req, res) => {
    client.query(`SELECT id, picture, name, email FROM users ORDER BY RANDOM() LIMIT 1`)
    .then(data => res.json(data.rows))
})

module.exports = twitter