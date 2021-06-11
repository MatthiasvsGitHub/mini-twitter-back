const twitter = require('express').Router()
const express = require('express')
twitter.use(express.urlencoded({ extended: false }))
const client = require('../client.js')
const path = require('path');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verifyToken = require('../verifyToken');

/* Documentation */

twitter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../documentation.html'))
})

/* Login, Authentification and Verifying */

twitter.get('/login', async (req, res) => {
    const emailParam = [req.body.email]
    const user = await client.query("SELECT email, password FROM users WHERE email=$1", emailParam)
    if (!user.rows[0]) return res.json('Email does not exists')

    const comparePassword = await bcrypt.compare(req.body.password, user.rows[0].password)
    if (!comparePassword) return res.status(400).send('Wrong password')

    const token = jwt.sign({user}, process.env.SECRET, { expiresIn: '1h' })
    res.header('auth-token', token)
    res.json(token)
})


twitter.get('/thisuser', verifyToken, (req, res) => {
    res.json(req.user)
})

twitter.put('/users/:id/pw', async (req, res) => {
    if (!req.body.password) return res.json('password is required')
    const query = "UPDATE users SET password=$2 WHERE id=$1 RETURNING *"
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    const values = [req.params.id, hashPassword]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

/* User Routes */

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
        if (data.rows.length > 0) return res.json('Email already exists')
        else client.query(query, values)
            .then(data => res.json(data.rows))
    })
})

twitter.delete('/users/:id', (req, res) => {
    const { id } = req.params
    const query = "DELETE FROM users WHERE id=$1"
    const values = [id]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

twitter.post('/users', async (req, res) => {
    const { picture, name, email, password } = req.body
    if (!name || !email || !password) return res.json('name, email and password is required')
    const query = "INSERT INTO users (picture, name, email, password) VALUES($1, $2, $3, $4) RETURNING *"
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    const values = [picture, name, email, hashPassword]
    const emailParam = [email]
    await client.query("SELECT email FROM users WHERE email=$1", emailParam).then(data => {
        if (data.rows.length > 0) return res.json('Email already exists')
        else client.query(query, values)
            .then(data => res.json(data.rows))
    })
})

/* Random User */

twitter.get('/me', (req, res) => {
    client.query(`SELECT id, picture, name, email FROM users ORDER BY RANDOM() LIMIT 1`)
        .then(data => res.json(data.rows))
})

/* Messages Routes */

twitter.delete('/messages/:id', (req, res) => {
    const { id } = req.params
    const query = "DELETE FROM messages WHERE id=$1"
    const values = [id]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

twitter.get('/users/:user/messages', (req, res) => {
    const { user } = req.params
    const query = "SELECT text, time, picture, name, email, users.id FROM messages RIGHT JOIN users ON users.id=users_id WHERE users_id=$1 ORDER BY time DESC"
    const values = [user]
    client.query(query, values)
        .then(data => res.json(data.rows))
})


twitter.get('/messages', (req, res) => {
    client.query(`SELECT * FROM messages ORDER BY time DESC`)
        .then(data => res.json(data.rows))
})

twitter.get('/messages/:id', (req, res) => {
    const { id } = req.params
    const query = "SELECT * FROM messages WHERE id=$1"
    const values = [id]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

twitter.put('/messages/:id', (req, res) => {
    const { id } = req.params
    const { tags, likes } = req.body
    const query = "UPDATE messages SET tags=$2, likes=$3 WHERE id=$1 RETURNING *"
    const values = [id, tags, likes]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

twitter.post('/messages', (req, res) => {
    const { text, users_id, tags, likes } = req.body
    if (!text || !users_id || !tags) return res.json('text, users_id and likes is required')
    const query = "INSERT INTO messages (text, users_id, tags, likes) VALUES($1, $2, $3, $4) RETURNING *"
    const values = [text, users_id, tags, likes]
    client.query(query, values)
        .then(data => res.json(data.rows))
})

module.exports = twitter