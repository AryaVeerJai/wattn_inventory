const BOM = require("../models/BOM");
const StockTransaction = require("../models/StockTransaction");
const Stock = require("../models/Stock");

// 🔁 Recursive consumption
const consumeStockRecursive = async (itemId, qty, session = null) => {
  const bom = await BOM.findOne({ parentItem: itemId });

  // 👉 If NO BOM → PART → deduct directly
  if (!bom) {
    // 1️⃣ Create transaction
    await StockTransaction.create([{
      item: itemId,
      type: "OUT",
      quantity: qty,
      reason: "AUTO_CONSUME"
    }], { session });

    // 2️⃣ Update actual stock
    await Stock.findOneAndUpdate(
      { item: itemId },
      { $inc: { quantity: -qty } },
      { upsert: true, session }
    );

    return;
  }

  // 👉 If BOM exists → go deeper
  for (const comp of bom.components) {
    const requiredQty = comp.quantity * qty;

    await consumeStockRecursive(
      comp.item,
      requiredQty,
      session
    );
  }
};

module.exports = {
  consumeStockRecursive,
};