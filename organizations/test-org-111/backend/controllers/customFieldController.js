// controllers/customFieldController.js
const CustomField = require("../models/CustomField");

// ✅ Create Field
exports.createField = async (req, res) => {
  console.log("Creating Field with data:", req.body);
  try {
    const field = await CustomField.create(req.body);
    res.status(201).json(field);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Fields
exports.getAllFields = async (req, res) => {
  try {
    const fields = await CustomField.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Single Field
exports.getFieldById = async (req, res) => {
  try {
    const field = await CustomField.findById(req.params.id);
    if (!field) return res.status(404).json({ message: "Field not found" });

    res.json(field);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Field
exports.updateField = async (req, res) => {
  try {
    const field = await CustomField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!field) return res.status(404).json({ message: "Field not found" });

    res.json(field);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Field (Soft Delete)
exports.deleteField = async (req, res) => {
  try {
    const field = await CustomField.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!field) return res.status(404).json({ message: "Field not found" });

    res.json({ message: "Field deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};