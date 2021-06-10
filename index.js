const express = require('express')
const app = express()
const port = process.env.PORT || 3002
const twitter = require('./routes/twitter')
const cors = require('cors')
app.use(cors())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/', twitter)


app.listen(port, console.log(`Server is listening on port ${port}`));