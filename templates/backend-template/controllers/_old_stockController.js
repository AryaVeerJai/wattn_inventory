const Stock = require("../models/StockTransaction");

// exports.createTransaction = async (req, res) => {
//   try {
//     const { item, type, quantity, reference, note } = req.body;

//     const tx = await Stock.create({
//       item,
//       type,
//       quantity,
//       reference,
//       note,
//     });

//     res.json({ success: true, data: tx });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// ✅ CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const { item, type, quantity, reference, note } = req.body;

    if (!item || !type || !quantity) {
      return res.status(400).json({
        message: "item, type, quantity are required",
      });
    }

    // 👉 Create main transaction
    const tx = await Stock.create({
      item,
      type,
      quantity,
      reference,
      note,
    });

    // 🔥 AUTO BOM DEDUCTION (only when OUT)
    if (type === "OUT") {
      const bom = await BOM.findOne({ parentItem: item });

      if (bom) {
        for (const comp of bom.components) {
          await Stock.create({
            item: comp.item,
            type: "OUT",
            quantity: comp.quantity * quantity,
            note: "Auto deducted via BOM",
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: tx,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error creating transaction",
    });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const data = await Stock.find()
      .populate("item", "name type")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStockSummary = async (req, res) => {
  try {
    const data = await Stock.aggregate([
      {
        $group: {
          _id: "$item",
          stock: {
            $sum: {
              $cond: [
                { $eq: ["$type", "IN"] },
                "$quantity",
                { $multiply: ["$quantity", -1] },
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};