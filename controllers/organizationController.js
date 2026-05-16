const DynamicModel = require('../models/dynamicModel');
const OrganizationModel = require('../models/organizationModel');
const createOrganizationStructure = require('../utilis/createOrganizationStructure');
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const fs = require("fs-extra");
const { exec } = require("child_process");
const mongoose = require("mongoose");
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

const createOrganization = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);

  try {
    const organizationData = {
      name: req.body.name,
      email: req.body.email,
      gst: req.body.gst,
      category: req.body.category,
      address: req.body.address,
      noOfUsers: parseInt(req.body.noOfUsers),
      portNumber: parseInt(req.body.portNumber),
    };

    if (req.file) {
      organizationData.logo = `/uploads/logos/${req.file.filename}`;
    }

    const newDynamicDoc = new OrganizationModel(organizationData);

    await newDynamicDoc.save();

    // CREATE ORGANIZATION TEMPLATE
    await createOrganizationStructure(newDynamicDoc, req.file);

    res.status(201).json({
      message: "Organization created successfully",
      data: newDynamicDoc,
    });

  } catch (error) {
    console.log("Error:", error.message);

    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Error creating organization",
      error: error.message,
    });
  }
};

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
      portNumber: req.body.portNumber,
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

const changePassword = async (req, res) => {
  // console.log(req.body)
  try {
    const { newPassword } = req.body;
    const mongoose = require('mongoose');
    const organization = await OrganizationModel.findById(req.params.id);
    // console.log(organization)
    // console.log(req.params.id)

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verify current password (implement your password verification logic)
    // const isMatch = await bcrypt.compare(currentPassword, organization.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: 'Current password is incorrect' });
    // }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedPassword)
    organization.password = hashedPassword;
    await organization.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
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

// const deleteMultipleOrganizations = async (req, res, next) => {
//   console.log(req.body)
//   const { organizationIds } = req.body;

//   if (!organizationIds || organizationIds.length === 0) {
//     return next(new ErrorHandler("No Organization IDs provided", 400));
//   }

//   // Check if all IDs exist
//   const organizations = await OrganizationModel.find({ _id: { $in: organizationIds } });

//   if (organizations.length !== organizationIds.length) {
//     return next(new ErrorHandler("One or more organizations not found", 404));
//   }

//   // Delete all organizations
//   await OrganizationModel.deleteMany({ _id: { $in: organizationIds } });

//   res.status(200).json({
//     success: true,
//     message: `${organizationIds.length} Organization deleted successfully`,
//   });
// };

const deleteMultipleOrganizations = async (req, res, next) => {
  try {
    const { organizationIds } = req.body;

    if (!organizationIds || organizationIds.length === 0) {
      return next(new ErrorHandler("No Organization IDs provided", 400));
    }

    // Get orgs
    const organizations = await OrganizationModel.find({
      _id: { $in: organizationIds },
    });

    if (organizations.length !== organizationIds.length) {
      return next(new ErrorHandler("One or more organizations not found", 404));
    }

    // =========================
    // CLEAN INFRASTRUCTURE FIRST
    // =========================
    for (const org of organizations) {
      await deleteOrganizationStructure(org);
    }

    // =========================
    // DELETE FROM MAIN DB
    // =========================
    await OrganizationModel.deleteMany({
      _id: { $in: organizationIds },
    });

    return res.status(200).json({
      success: true,
      message: `${organizationIds.length} Organizations deleted successfully`,
    });

  } catch (error) {
    next(error);
  }
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
  changePassword,
  deleteOrganization,
  deleteMultipleOrganizations,
  getAllOrganizations,
  upload
};
