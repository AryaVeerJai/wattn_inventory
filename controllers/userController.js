const User = require('../models/user');
const ErrorHandler = require("../utilis/errorHandler");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Ensure upload directory exists
const uploadDir = 'uploads/user-image';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: profilePic-timestamp-randomnumber.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'user-image-' + uniqueSuffix + ext);
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


// Create a new User
const createUser = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      phoneNo: parseInt(req.body.phoneNo),
    };

    // Add profilePic path if file was uploaded
    if (req.file) {
      // Store relative path or just filename based on your needs
      userData.profilePic = `/uploads/user-image/${req.file.filename}`;
      // OR if you want full path: userData.profilePic = req.file.path;
    }

    console.log('User data to save:', userData);

    const newDynamicDoc = new User(userData);
    await newDynamicDoc.save();
    
    res.status(201).json({
      message: 'User created successfully',
      data: newDynamicDoc,
    });
  } catch (error) {
    console.log('Error:', error.message);
    
    // Delete uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error creating User', 
      error: error.message 
    });
  }
};


// Get a User by ID
const getUserById = async (req, res) => {
  try {
    const doc = await User.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};


// Update organization
const updateUser = async (req, res) => {
  console.log("Update User", req.body)
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      phoneNo: req.body.phoneNo,
    };

    // If new profilePic uploaded, update it
    if (req.file) {
      updateData.profilePic = `/uploads/user-image/${req.file.filename}`;
    }

    const updatedOrg = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedOrg,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a dynamic field
const deleteUser = async (req, res) => {
  try {
    const { fieldName } = req.body;

    // Delete a custom field dynamically
    const updateObj = {};
    updateObj[`customFields.${fieldName}`] = 1;
    const updatedDoc = await User.findByIdAndUpdate(
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

const deleteMultipleUser = async (req, res, next) => {
  console.log(req.body)
  const { orgUserIds } = req.body;

  if (!orgUserIds || orgUserIds.length === 0) {
    return next(new ErrorHandler("No Organization IDs provided", 400));
  }

  // Check if all IDs exist
  const organizations = await User.find({ _id: { $in: orgUserIds } });
  console.log(organizations)

  if (organizations.length !== orgUserIds.length) {
    return next(new ErrorHandler("One or more organizations not found", 404));
  }

  // Delete all users
  await User.deleteMany({ _id: { $in: orgUserIds } });

  res.status(200).json({
    success: true,
    message: `${orgUserIds.length} User deleted successfully`,
  });
};

// Get all Users
const getAllUser = async (req, res) => {
    try {
      const docs = await User.find(); // Find all Users
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  };

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  deleteMultipleUser,
  getAllUser,
  upload
};
