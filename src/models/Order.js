const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  status: { type: String, default: 'completed' },
  total: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  date_created: { type: String, required: true },
  date_modified: { type: String },
  customer_id: { type: String },
  source: { type: String, enum: ["woocommerce", "amazon"], required: true },
  line_items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: String, required: true },
    bookId: { type: String, required: true },
    total: { type: Number, required: true }
  }],
  billing: {
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    address_1: String,
    city: String,
    state: String,
    postcode: String,
    country: String
  },
  shipping: {
    first_name: String,
    last_name: String,
    address_1: String,
    city: String,
    state: String,
    postcode: String,
    country: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
