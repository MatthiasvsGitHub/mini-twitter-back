const twitter = require('express').Router()
const express = require('express')
twitter.use(express.urlencoded({ extended: false }))
const client = require('../client.js')
const path = require('path');

twitter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../documentation.html'))
})


twitter.get('/users', (req, res) => {
    client.query('SELECT id, picture, name, email FROM users')
    .then(data => res.json(data.rows))
})


twitter.get('/users/:id', (req, res) => {
    const query = "SELECT id, picture, name, email FROM users WHERE id=$1"
    const values = [req.params.id]
    client.query(query, values)
    .then(data => res.json(data.rows))
})

twitter.put('/users/:id', async (req, res) => {
    if (!req.body.picture || !req.body.name || !req.body.email) return res.json('name, email and picture is required')
    const query = "UPDATE users SET picture=$2, name=$3, email=$4 WHERE id=$1 RETURNING *"
    const values = [req.params.id, req.body.picture, req.body.name, req.body.email]
    const emailParam = [req.body.email]
    await client.query("SELECT email FROM users WHERE email=$1", emailParam).then(data => {
        if(data.rows.length>0) return res.json('Email already exists')
        else client.query(query, values)
        .then(data => res.json(data.rows))
    })
})

twitter.delete('/users/:id', (req, res) => {
    const {id} = req.params
    const query = "DELETE FROM users WHERE id=$1"
    const values = [id]
    client.query(query, values)
    .then(data => res.json(data.rows))
})

twitter.delete('/messages/:id', (req, res) => {
    const {id} = req.params
    const query = "DELETE FROM messages WHERE id=$1"
    const values = [id]
    client.query(query,values)
    .then(data => res.json(data.rows))
})

twitter.get('/users/:user/messages', (req, res) => {
    const {user} = req.params
    const query = "SELECT text, time, picture, name, email, users.id FROM messages RIGHT JOIN users ON users.id=users_id WHERE users_id=$1 ORDER BY time ASC"
    const values = [user]
    client.query(query, values)
    .then(data => res.json(data.rows))
})

twitter.post('/users', async (req, res) => {
    const {picture, name, email, password} = req.body
    if (!name || !email || !password) return res.json('name, email and password is required')
    const query = "INSERT INTO users (picture, name, email, password) VALUES($1, $2, $3, $4) RETURNING *"
    const values = [picture, name, email, password]
    const emailParam = [email]
    await client.query("SELECT email FROM users WHERE email=$1", emailParam).then(data => {
        if(data.rows.length>0) return res.json('Email already exists')
        else client.query(query,values)
        .then(data => res.json(data.rows))
    })
})

twitter.get('/messages', (req, res) => {
    client.query(`SELECT * FROM messages ORDER BY time ASC`)
    .then(data => res.json(data.rows))
})

twitter.get('/messages/:id', (req, res) => {
    let {id} = req.params
    const query = "SELECT * FROM messages WHERE id=$1"
    const values = [id]
    client.query(query, values)
    .then(data => res.json(data.rows))
})

twitter.post('/messages', (req, res) => {
    const {text, users_id} = req.body
    if (!text || !users_id) return res.json('text and users_id is required')
    const query = "INSERT INTO messages (text, users_id) VALUES($1, $2) RETURNING *"
    const values = [text, users_id]
    client.query(query, values)
    .then(data => res.json(data.rows))
})

twitter.get('/me', (req, res) => {
    client.query(`SELECT id, picture, name, email FROM users ORDER BY RANDOM() LIMIT 1`)
    .then(data => res.json(data.rows))
})

module.exports = twitter