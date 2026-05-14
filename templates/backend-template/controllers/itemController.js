// controllers/itemController.js
const Item = require("../models/Item");
const CustomField = require("../models/CustomField");

const fs = require("fs");
const csv = require("csv-parser");


const generateInvNumber = async (type) => {
  const prefixMap = {
    PART: "P-",
    SUBASSEMBLY: "SA-",
    ASSEMBLY: "A-",
  };

  const prefix = prefixMap[type];

  // Find last item of same type
  const lastItem = await Item.findOne({
    invNumber: { $regex: `^${prefix}` }
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastItem) {
    const lastNum = parseInt(lastItem.invNumber.replace(prefix, ""), 10);
    nextNumber = lastNum + 1;
  }

  return prefix + String(nextNumber).padStart(1, "0");
};


// 🔥 Helper: Validate Attributes
const validateAttributes = async (attributes) => {
  const fields = await CustomField.find({ isActive: true });

  for (let field of fields) {
    const value = attributes?.[field.fieldName];

    // Required check
    if (field.required && (value === undefined || value === null || value === "")) {
      throw new Error(`${field.label} is required`);
    }

    if (value !== undefined) {
      switch (field.type) {
        case "number":
          if (isNaN(value)) throw new Error(`${field.label} must be a number`);
          break;

        case "boolean":
          if (typeof value !== "boolean") throw new Error(`${field.label} must be boolean`);
          break;

        case "date":
          if (isNaN(Date.parse(value))) throw new Error(`${field.label} must be a valid date`);
          break;

        case "string":
        default:
          break;
      }
    }
  }
};


// ✅ Create Item
// exports.createItem = async (req, res) => {
//   try {
//     const { name, type, invNumber, attributes } = req.body;

//     await validateAttributes(attributes);

//     const item = await Item.create({
//       name,
//       type,
//       invNumber,
//       attributes,
//     });

//     res.status(201).json(item);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.createItem = async (req, res) => {
//   try {
//     const { name, type, attributes } = req.body;

//     await validateAttributes(attributes);

//     // 🔥 Generate invNumber here (NOT from frontend)
//     const invNumber = await generateInvNumber(type);

//     const item = await Item.create({
//       name,
//       type,
//       invNumber,
//       attributes,
//     });

//     res.status(201).json(item);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


exports.createItem = async (req, res) => {
  try {
    let { name, type, attributes } = req.body;

    // Parse JSON attributes
    attributes = attributes
      ? JSON.parse(attributes)
      : {};

    await validateAttributes(attributes);

    // Generate inventory number
    const invNumber = await generateInvNumber(type);

    const item = await Item.create({
      name,
      type,
      invNumber,
      attributes,

      // Save uploaded image
      // image: req.file ? req.file.path : null,
      image: req.file
      ? `/uploads/${req.file.filename}`
      : null,
    });

    res.status(201).json(item);

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};


// ✅ Get All Items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get Item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Update Item
exports.updateItem = async (req, res) => {
  // console.log("Update request received for item ID:", req.params.id);
  // console.log("Request body:", req.body);
  // console.log("Uploaded file:", req.file);
  try {
    let { name, type, attributes } = req.body;

    // Parse JSON attributes
    attributes = attributes
      ? JSON.parse(attributes)
      : {};

    await validateAttributes(attributes);

    // Find existing item
    const existingItem = await Item.findById(req.params.id);

    if (!existingItem) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Preserve old image
    let image = existingItem.image;

    // Replace image if uploaded
    if (req.file) {
      // image = req.file.path;
      image = `/uploads/${req.file.filename}`;
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        attributes,
        image,
      },
      { new: true }
    );

    res.json(item);

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
// exports.updateItem = async (req, res) => {
//   try {
//     const { name, type, invNumber, attributes } = req.body;

//     await validateAttributes(attributes);

//     const item = await Item.findByIdAndUpdate(
//       req.params.id,
//       { name, type, invNumber, attributes },
//       { new: true }
//     );

//     if (!item) return res.status(404).json({ message: "Item not found" });

//     res.json(item);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


// ✅ Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Preview only (DO NOT use for saving)
exports.getLastNumber = async (req, res) => {
  // console.log("Generating preview number for type:", req.params.type);
  try {
    const { type } = req.params;

    const prefixMap = {
      PART: "P-",
      SUBASSEMBLY: "SA-",
      ASSEMBLY: "A-",
    };

    const prefix = prefixMap[type];

    const lastItem = await Item.findOne({
      invNumber: { $regex: `^${prefix}` },
    }).sort({ createdAt: -1 });

    // console.log("Last item found:", lastItem ? lastItem.invNumber : "None");

    let nextNumber = 1;

    if (lastItem) {
      const lastNum = parseInt(lastItem.invNumber.replace(prefix, ""), 10);
      nextNumber = lastNum + 1;
    }

    const preview = prefix + String(nextNumber).padStart(1, "0");

    res.json({ invNumber: preview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// // ✅ Bulk Upload Items via CSV
// exports.bulkUploadItems = async (req, res) => {
//   console.log("Bulk upload initiated", "File:", req.file);
//   try {
//     const results = [];

//     if (!req.file) {
//       return res.status(400).json({
//         message: "CSV file is required",
//       });
//     }

//     fs.createReadStream(req.file.path)
//       .pipe(csv())
//       .on("data", (data) => {
//         results.push(data);
//       })
//       .on("end", async () => {
//         try {
//           const createdItems = [];

//           for (const row of results) {

//   const attributes = {};

//   // Extract dynamic attributes
//   Object.keys(row).forEach((key) => {

//     const value = row[key];

//     if (key.startsWith("attributes.")) {

//       const attrKey = key.replace(
//         "attributes.",
//         ""
//       ).trim();

//       attributes[attrKey] =
//         value?.trim?.() || value;
//     }
//   });

//   // Validate attributes
//   await validateAttributes(attributes);

//   // Generate inv number if not provided
//   const invNumber =
//     row.invNumber ||
//     await generateInvNumber(row.type);

//   const item = await Item.create({

//     name: row.name,
//     type: row.type,

//     image: row.image || null,

//     invNumber,

//     attributes,
//   });

//   createdItems.push(item);
// }

//           res.status(201).json({
//             message: "Bulk upload successful",
//             total: createdItems.length,
//             items: createdItems,
//           });

//         } catch (err) {
//           res.status(400).json({
//             message: err.message,
//           });
//         }
//       });

//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// };


exports.bulkUploadItems = async (req, res) => {
  // console.log("Bulk upload initiated", "File:", req.file);

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const results = [];

    // ✅ Wrap stream in Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const createdItems = [];

    for (const row of results) {

      const attributes = {};

      Object.keys(row).forEach((key) => {

        const value = row[key];

        if (key.startsWith("attributes.")) {

          const attrKey = key
            .replace("attributes.", "")
            .trim();

          attributes[attrKey] =
            value?.trim?.() || value;
        }
      });

      // Validate attributes
      await validateAttributes(attributes);

      const invNumber =
        row.invNumber ||
        await generateInvNumber(row.type);

      const item = await Item.create({
        name: row.name,
        type: row.type,
        image: row.image || null,
        invNumber,
        attributes,
      });

      createdItems.push(item);
    }

    // Optional cleanup
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      message: "Bulk upload successful",
      total: createdItems.length,
      items: createdItems,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};