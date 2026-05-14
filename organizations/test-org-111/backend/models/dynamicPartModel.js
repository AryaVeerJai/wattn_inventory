const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the sub-document schema for individual fields
const dynamicFieldSchema = new Schema({
  value: { type: Schema.Types.Mixed }, // This allows any type of value (string, number, object, etc.)
});

// Define the main schema that includes dynamic fields
const dynamicPartSchema = new Schema({
  field1: {
    type: Schema.Types.Mixed
  },
  field2: {
    type: Schema.Types.Mixed
  },
  field3: {
    type: Schema.Types.Mixed
  },
  field4: {
    type: Schema.Types.Mixed
  },
  field5: {
    type: Schema.Types.Mixed
  },
  field6: {
    type: Schema.Types.Mixed
  },
  field7: {
    type: Schema.Types.Mixed
  },
  field8: {
    type: Schema.Types.Mixed
  },
  field9: {
    type: Schema.Types.Mixed
  },
  field10: {
    type: Schema.Types.Mixed
  },
  customFields: { type: Map, of: dynamicFieldSchema }, // To store any custom field dynamically
});

// Model creation
const DynamicPartModel = mongoose.model('DynamicPart', dynamicPartSchema);

module.exports = DynamicPartModel;
