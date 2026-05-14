// const express = require("express");
// const router = express.Router();

// const {
//   createTransaction,
//   getTransactions,
//   getStockSummary,
// } = require("../controllers/stockController");

// router.post("/create", createTransaction);
// router.get("/", getTransactions);
// router.get("/summary", getStockSummary);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  createTransaction,
  produceItem,
  getTransactions,
  getStockSummary,
  bulkStockUpload,
} = require("../controllers/stockController");

router.post("/create", createTransaction);
router.post("/bulk-upload", bulkStockUpload);
router.post("/produce", produceItem);

router.get("/", getTransactions);
router.get("/summary", getStockSummary);

module.exports = router;