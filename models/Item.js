const mongoose  = require('mongoose')

const Item = mongoose.model('Item', {
    name: String,
    created: String,
    until: String,
    description: String,
    unit: String,
    condominum: String,
    operator: String,
    status: String
})

module.exports = Item;