const mongoose = require("mongoose")

const orderHistorySchema = new mongoose.Schema({
    id: Number,
    tracking_number: String,
    amount: Number,
    total: Number,
    delivery_fee: Number,
    discount: Number,
    status: {
        id: Number,
        name: String,
        serial: Number,
        color: String,
        created_at: Date,
        updated_at: Date
    },
    delivery_time: String,
    created_at: Date,
    products: [
        {
        id: Number,
        name: String,
        quantity: Number,
        price: Number,
        image: {
            id: Number,
            thumbnail: String
        }
        }
    ],
    shipping_address: {
        street_address: String,
        country: String,
        city: String,
        state: String,
        zip: String
    }
}, 
{timestamps: true})

module.exports = mongoose.model("OrderHistory", orderHistorySchema) 