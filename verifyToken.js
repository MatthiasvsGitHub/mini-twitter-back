const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const token = req.body.authToken
    if(!token) return res.status(400).send('Access denied')
    try{
            const verified = jwt.verify(token, process.env.SECRET)
            req.user = verified
            next()
    }
    catch(err){
            res.send('error')
    }
}

module.exports = verifyToken