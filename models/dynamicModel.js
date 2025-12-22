const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the sub-document schema for individual fields
const dynamicFieldSchema = new Schema({
  name: { type: String },
  // value: { type: Schema.Types.Mixed }, // This allows any type of value (string, number, object, etc.)
  type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'object', ''] },
  enabled: {type: Boolean}
});

// Define the main schema that includes dynamic fields
const dynamicSchema = new Schema({
  field1: dynamicFieldSchema,
  field2: dynamicFieldSchema,
  field3: dynamicFieldSchema,
  field4: dynamicFieldSchema,
  field5: dynamicFieldSchema,
  field6: dynamicFieldSchema,
  field7: dynamicFieldSchema,
  field8: dynamicFieldSchema,
  field9: dynamicFieldSchema,
  field10: dynamicFieldSchema,
  customFields: { type: Map, of: dynamicFieldSchema }, // To store any custom field dynamically
});

// Model creation
const DynamicModel = mongoose.model('Dynamic', dynamicSchema);

module.exports = DynamicModel;
