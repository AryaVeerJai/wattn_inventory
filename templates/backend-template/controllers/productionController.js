const mongoose = require("mongoose");

const StockTransaction = require("../models/StockTransaction");
const Stock = require("../models/Stock");
const { consumeStockRecursive } = require("../services/stockService");

exports.produceItem = async (req, res) => {
  console.log("Production request received:", req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      throw new Error("itemId and quantity required");
    }

    // 1️⃣ Deduct components (recursive)
    await consumeStockRecursive(itemId, quantity, session);

    // 2️⃣ Add production transaction
    await StockTransaction.create([{
      item: itemId,
      type: "IN",
      quantity,
      reason: "PRODUCTION"
    }], { session });

    // 3️⃣ 🔥 UPDATE ACTUAL STOCK (THIS WAS MISSING)
    await Stock.findOneAndUpdate(
      { item: itemId },
      { $inc: { quantity: quantity } },
      { upsert: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Production completed" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({ message: err.message });
  }
};