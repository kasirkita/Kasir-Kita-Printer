const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept")
    next()
})

const preview = require('./app/preview')
const label = require('./app/label')
const receipt = require('./app/receipt')
const labelDiscount = require('./app/labelDiscount')

app.get('/', (req, res) => res.status(200).json('Printer tersambung'))
app.route('/preview').post(preview.preview)
app.route('/label').post(label.label)
app.route('/receipt').post(receipt.receipt)
app.route('/label-discount').post(labelDiscount.labelDiscount)

app.listen(port, () => console.log(`Printer is running on port ${port}`))