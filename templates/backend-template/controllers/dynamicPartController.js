const DynamicPartModel = require('../models/dynamicPartModel');

// Create a new dynamic document
const createDynamicPartDocument = async (req, res) => {
  console.log(req.body)
  try {
    // console.log(req.body)
    const newDynamicDoc = new DynamicPartModel(req.body);
    await newDynamicDoc.save();
    res.status(201).json({
      message: 'Dynamic document created successfully',
      data: newDynamicDoc,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
};

// Get a dynamic document by ID
const getDynamicDocumentById = async (req, res) => {
  try {
    const doc = await DynamicPartModel.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

// // Update a dynamic field
// const updateDynamicField = async (req, res) => {
//   try {
//     // const { fieldName, name, value, type } = req.body;
//     const { fieldName, name, type, enabled } = req.body;
//     const updateObj = { [`${fieldName}.name`]: name, [`${fieldName}.type`]: type, [`${fieldName}.enabled`]: enabled};

//     const updatedDoc = await DynamicPartModel.findByIdAndUpdate(req.params.id, { $set: updateObj }, { new: true });
//     if (!updatedDoc) {
//       return res.status(404).json({ message: 'Document not found' });
//     }
//     res.status(200).json({
//       message: `Field '${fieldName}' updated successfully`,
//       data: updatedDoc,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating field', error: error.message });
//   }
// };

// Update all dynamic fields
const updateDynamicField = async (req, res) => {
  try {
    const { formData } = req.body; // Receive the entire formData object

    // Construct the update object dynamically
    const updateObj = {};
    for (const [fieldName, fieldData] of Object.entries(formData)) {
      updateObj[`${fieldName}.name`] = fieldData.name;
      updateObj[`${fieldName}.type`] = fieldData.type;
      updateObj[`${fieldName}.enabled`] = fieldData.enabled;
    }

    // Update the document
    const updatedDoc = await DynamicPartModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateObj },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({
      message: 'All fields updated successfully',
      data: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fields', error: error.message });
  }
};

// Delete a dynamic field
const deleteDynamicField = async (req, res) => {
  try {
    const { fieldName } = req.body;

    // Delete a custom field dynamically
    const updateObj = {};
    updateObj[`customFields.${fieldName}`] = 1;
    const updatedDoc = await DynamicPartModel.findByIdAndUpdate(
      req.params.id,
      { $unset: updateObj },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({
      message: `Field '${fieldName}' deleted successfully`,
      data: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting field', error: error.message });
  }
};

// Get all dynamic documents
const getAllDynamicPartsDocuments = async (req, res) => {
    try {
      const docs = await DynamicPartModel.find(); // Find all dynamic documents
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  };

module.exports = {
  createDynamicPartDocument,
  getDynamicDocumentById,
  updateDynamicField,
  deleteDynamicField,
  getAllDynamicPartsDocuments,
};
