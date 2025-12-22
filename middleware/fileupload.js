const multer = require('multer');
const path = require('path');
global.__basedir=__dirname;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, __basedir + "/uploads/");
    cb(null, path.join(__dirname, '../uploads/'));
    
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Filter for CSV file

// const csvFilter = (req, file, cb) => {
//     console.log(file)
//   if (file.mimetype.includes("csv")||file.mimetype.includes("application/vnd.ms-excel")) {
//     cb(null, true);
//   } else {
//     cb("Please upload only csv files.", false);
//   }
// };
// exports.upload = multer({ storage: storage, fileFilter: csvFilter });


const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv') || file.mimetype.includes('jpeg') || file.mimetype.includes('png')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, JPEG, and PNG files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = { upload };
