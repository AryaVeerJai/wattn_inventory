const express = require("express");
const router = express.Router();

const { produceItem } = require("../controllers/productionController");

router.post("/produce", produceItem);

module.exports = router;