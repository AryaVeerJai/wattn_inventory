const mongoose = require("mongoose");

// const AttributeValueSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   value: { type: String, required: true }
// }); // Disable _id for sub-documents

// const attributeSchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   values: [String],
// });

// const variationSchema = new mongoose.Schema({
//   id: Number,
//   attributes: Map,  // Store attributes with dynamic keys
// });

// const variationOptionSchema = new mongoose.Schema({
//   sku: String,
//   price: Number,
//   salePrice: Number,
//   quantity: Number,
//   is_disable: Number,
//   options: Map,  // Store options with dynamic keys
// });

// Define the schema for inventory
const materialsSchema = new mongoose.Schema({
    win: { type: String, required: true },
    part_number: { type: String, required: true, unique: true },
    manufacturer_name: { type: String, required: true },
    part_name: { type: String, required: true },
    value: { type: String, required: false }, // Optional field
    package_case: { type: String, required: false },
    image: { type: String, required: false }, // URL to the image
    description: { type: String, required: false },
    price_1_inr: { type: Number, required: false },
    price_10_inr: { type: Number, required: false },
    price_100_inr: { type: Number, required: false },
    footprint_details: { type: String, required: false },
    height: { type: Number, required: false },
    distributor_part_sku: { type: String, required: false },
    distributor: { type: String, required: false },
    generic_accepted: { type: String, required: false,},
    generic_manufacturing_part_number: { type: String, required: false },
    part_url: { type: String, required: false }, // URL to the part page
    datasheet: { type: String, required: false }, // URL to the datasheet
    notes: { type: String, required: false }
}, {
    timestamps: true // Automatically create `createdAt` and `updatedAt` fields
});

// module.exports = mongoose.model("list_material", materialsSchema);

// Create the model from the schema
const Material = mongoose.model('list_materials', materialsSchema);

module.exports = Material;