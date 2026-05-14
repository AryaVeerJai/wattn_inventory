const DynamicModel = require('../models/dynamicModel');
const OrganizationModel = require('../models/organizationModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Ensure upload directory exists
const uploadDir = 'uploads/logos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: logo-timestamp-randomnumber.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});


// Create a new Organization
const createOrganization = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    const organizationData = {
      name: req.body.name,
      email: req.body.email,
      gst: req.body.gst,
      category: req.body.category,
      address: req.body.address,
      noOfUsers: parseInt(req.body.noOfUsers),
    };

    // Add logo path if file was uploaded
    if (req.file) {
      // Store relative path or just filename based on your needs
      organizationData.logo = `/uploads/logos/${req.file.filename}`;
      // OR if you want full path: organizationData.logo = req.file.path;
    }

    console.log('Organization data to save:', organizationData);

    const newDynamicDoc = new OrganizationModel(organizationData);
    await newDynamicDoc.save();
    
    res.status(201).json({
      message: 'Organization created successfully',
      data: newDynamicDoc,
    });
  } catch (error) {
    console.log('Error:', error.message);
    
    // Delete uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error creating organization', 
      error: error.message 
    });
  }
};

// Create a new Organization
// const createOrganization = async (req, res) => {
//   console.log(req.body)
//   try {
//     const organizationData = {
//       name: req.body.name,
//       gst: req.body.gst,
//       category: req.body.category,
//       address: req.body.address,
//       noOfUsers: req.body.noOfUsers,
//     };

//     // If file was uploaded, add the logo path
//     if (req.file) {
//       organizationData.logo = `/uploads/logos/${req.file.filename}`;
//     }

//     const newDynamicDoc = new OrganizationModel(organizationData);
//     await newDynamicDoc.save();
    
//     res.status(201).json({
//       message: 'Organization created successfully',
//       data: newDynamicDoc,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: 'Error creating document', error: error.message });
//   }
// };

// Create a new Organization
// const createOrganization = async (req, res) => {
//   console.log(req.body)
//   try {
//     // console.log(req.body)
//     const newDynamicDoc = new OrganizationModel(req.body);
//     await newDynamicDoc.save();
//     res.status(201).json({
//       message: 'Organization created successfully',
//       data: newDynamicDoc,
//     });
//   } catch (error) {
//     console.log(error.message)
//     res.status(500).json({ message: 'Error creating document', error: error.message });
//   }
// };

// Get a Organization by ID
const getOrganizationById = async (req, res) => {
  try {
    const doc = await OrganizationModel.findById(req.params.id);
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

//     const updatedDoc = await DynamicModel.findByIdAndUpdate(req.params.id, { $set: updateObj }, { new: true });
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
// const updateOrganization = async (req, res) => {
//   try {
//     const { formData } = req.body; // Receive the entire formData object

//     // Construct the update object dynamically
//     const updateObj = {};
//     for (const [fieldName, fieldData] of Object.entries(formData)) {
//       updateObj[`${fieldName}.name`] = fieldData.name;
//       updateObj[`${fieldName}.type`] = fieldData.type;
//       updateObj[`${fieldName}.enabled`] = fieldData.enabled;
//     }

//     // Update the document
//     const updatedDoc = await OrganizationModel.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateObj },
//       { new: true }
//     );

//     if (!updatedDoc) {
//       return res.status(404).json({ message: 'Document not found' });
//     }

//     res.status(200).json({
//       message: 'All fields updated successfully',
//       data: updatedDoc,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating fields', error: error.message });
//   }
// };

// Update organization
const updateOrganization = async (req, res) => {
  console.log("Update Organization", req.body)
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      gst: req.body.gst,
      category: req.body.category,
      address: req.body.address,
      noOfUsers: req.body.noOfUsers,
    };

    // If new logo uploaded, update it
    if (req.file) {
      updateData.logo = `/uploads/logos/${req.file.filename}`;
    }

    const updatedOrg = await OrganizationModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({
      message: 'Organization updated successfully',
      data: updatedOrg,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
};

// Delete a dynamic field
const deleteOrganization = async (req, res) => {
  try {
    const { fieldName } = req.body;

    // Delete a custom field dynamically
    const updateObj = {};
    updateObj[`customFields.${fieldName}`] = 1;
    const updatedDoc = await OrganizationModel.findByIdAndUpdate(
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

const deleteMultipleOrganizations = async (req, res, next) => {
  console.log(req.body)
  const { organizationIds } = req.body;

  if (!organizationIds || organizationIds.length === 0) {
    return next(new ErrorHandler("No Organization IDs provided", 400));
  }

  // Check if all IDs exist
  const organizations = await OrganizationModel.find({ _id: { $in: organizationIds } });

  if (organizations.length !== organizationIds.length) {
    return next(new ErrorHandler("One or more organizations not found", 404));
  }

  // Delete all organizations
  await OrganizationModel.deleteMany({ _id: { $in: organizationIds } });

  res.status(200).json({
    success: true,
    message: `${organizationIds.length} Organization deleted successfully`,
  });
};

// Get all Organizations
const getAllOrganizations = async (req, res) => {
    try {
      const docs = await OrganizationModel.find(); // Find all Organizations
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  };

module.exports = {
  createOrganization,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  deleteMultipleOrganizations,
  getAllOrganizations,
  upload
};
