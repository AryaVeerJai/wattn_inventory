// const multer = require('multer');
// const path = require('path');
// global.__basedir=__dirname;
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb(null, __basedir + "/uploads/");
//     cb(null, path.join(__dirname, '../uploads/'));
    
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// // Filter for CSV file

// // const csvFilter = (req, file, cb) => {
// //     console.log(file)
// //   if (file.mimetype.includes("csv")||file.mimetype.includes("application/vnd.ms-excel")) {
// //     cb(null, true);
// //   } else {
// //     cb("Please upload only csv files.", false);
// //   }
// // };
// // exports.upload = multer({ storage: storage, fileFilter: csvFilter });


// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.includes('csv') || file.mimetype.includes('jpeg') || file.mimetype.includes('png')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only CSV, JPEG, and PNG files are allowed!'), false);
//   }
// };

// const upload = multer({ storage: storage, fileFilter: fileFilter });

// module.exports = { upload };


const multer = require("multer");
const path = require("path");

global.__basedir = __dirname;

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, uniqueSuffix + ext);
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "text/csv",
    "application/vnd.ms-excel",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only CSV, JPEG, JPG, PNG, and WEBP files are allowed!"
      ),
      false
    );
  }
};

// Multer Upload
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = { upload };
