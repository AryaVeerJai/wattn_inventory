const StockTransaction = require("../models/StockTransaction");
const Stock = require("../models/Stock");
const BOM = require("../models/BOM");
const Item = require("../models/Item");

// =========================
// 📦 CREATE MANUAL TRANSACTION
// =========================
exports.createTransaction = async (req, res) => {
  try {
    const { item, type, quantity, note } = req.body;

    if (!item || !type || !quantity) {
      return res.status(400).json({
        message: "item, type, quantity required",
      });
    }

    // 1️⃣ Save transaction
    const tx = await StockTransaction.create({
      item,
      type,
      quantity,
      reason: "MANUAL",
      note,
    });

    // 2️⃣ Update stock
    const updateQty = type === "IN" ? quantity : -quantity;

    await Stock.findOneAndUpdate(
      { item },
      { $inc: { quantity: updateQty } },
      { upsert: true }
    );

    res.json({ success: true, data: tx });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// ⚙️ PRODUCE ITEM (BOM)
// =========================
exports.produceItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    const bom = await BOM.findOne({ parentItem: itemId });

    if (!bom) {
      return res.status(400).json({
        message: "No BOM found",
      });
    }

    // 🔍 Check stock availability
    for (const comp of bom.components) {
      const stock = await Stock.findOne({ item: comp.item });

      const requiredQty = comp.quantity * quantity;

      if (!stock || stock.quantity < requiredQty) {
        return res.status(400).json({
          message: `Insufficient stock for component`,
        });
      }
    }

    // 🔻 Deduct components
    for (const comp of bom.components) {
      const deductQty = comp.quantity * quantity;

      await StockTransaction.create({
        item: comp.item,
        type: "OUT",
        quantity: deductQty,
        reason: "AUTO_CONSUME",
      });

      await Stock.findOneAndUpdate(
        { item: comp.item },
        { $inc: { quantity: -deductQty } }
      );
    }

    // 🔺 Add final product
    await StockTransaction.create({
      item: itemId,
      type: "IN",
      quantity,
      reason: "PRODUCTION",
    });

    await Stock.findOneAndUpdate(
      { item: itemId },
      { $inc: { quantity } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Production completed",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Production failed",
    });
  }
};

// =========================
// 📊 GET TRANSACTIONS
// =========================
exports.getTransactions = async (req, res) => {
  try {
    const data = await StockTransaction.find()
      .populate("item", "name type")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// ⚡ FAST STOCK SUMMARY
// =========================
exports.getStockSummary = async (req, res) => {
  try {
    const data = await Stock.find()
      .populate("item", "name type image")
      .sort({ updatedAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.bulkStockUpload = async (req, res) => {
//   try {
//     const rows = req.body; // array

//     if (!Array.isArray(rows) || !rows.length) {
//       return res.status(400).json({ message: "No data provided" });
//     }

//     for (const row of rows) {
//       const { item, type, quantity, reason } = row;

//       await StockTransaction.create({
//         item,
//         type,
//         quantity,
//         reason: reason || "BULK_UPLOAD",
//       });

//       const updateQty = type === "IN" ? quantity : -quantity;

//       await Stock.findOneAndUpdate(
//         { item },
//         { $inc: { quantity: updateQty } },
//         { upsert: true }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Bulk stock updated",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.bulkStockUpload = async (req, res) => {
  try {
    const rows = req.body;

    for (const row of rows) {
      const { invNumber, type, quantity, reason, note } = row;

      // 🔍 FIND ITEM BY invNumber
      const item = await Item.findOne({ invNumber });

      if (!item) {
        console.log("Item not found:", invNumber);
        continue;
      }

      // 1️⃣ Create transaction
      await StockTransaction.create({
        item: item._id,
        type,
        quantity,
        reason,
        note,
      });

      // 2️⃣ Update stock
      const updateQty = type === "IN" ? quantity : -quantity;

      await Stock.findOneAndUpdate(
        { item: item._id },
        { $inc: { quantity: updateQty } },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: "Bulk stock updated using invNumber",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};