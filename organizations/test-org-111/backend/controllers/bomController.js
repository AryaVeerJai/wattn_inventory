const BOM = require("../models/BOM");

// Create or Update BOM
exports.saveBOM = async (req, res) => {
  try {
    const { parentItem, components } = req.body;

    let bom = await BOM.findOne({ parentItem });

    if (bom) {
      bom.components = components;
      await bom.save();
    } else {
      bom = await BOM.create({ parentItem, components });
    }

    res.json({ success: true, data: bom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const Item = require("../models/Item");

exports.getBOMTree = async (req, res) => {
  try {
    const { itemId } = req.params;

    const buildTree = async (id, quantity = 1) => {
      const item = await Item.findById(id);

      if (!item) return null;

      const node = {
        _id: item._id,
        name: item.name,
        type: item.type,
        quantity,
        children: [],
      };

      const bom = await BOM.findOne({ parentItem: id });

      if (bom) {
        for (const comp of bom.components) {
          const child = await buildTree(
            comp.item,
            comp.quantity
          );
          if (child) node.children.push(child);
        }
      }

      return node;
    };

    const tree = await buildTree(itemId);

    res.json(tree);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.getBOMByItem = async (req, res) => {
//   try {
//     const bom = await BOM.findOne({
//       parentItem: req.params.itemId,
//     });

//     res.json(bom);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getBOMByItem = async (req, res) => {
  try {
    const bom = await BOM.findOne({
      parentItem: req.params.itemId,
    })
      .populate("parentItem")
      .populate("components.item");

    res.json(bom);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteBOM = async (req, res) => {
  try {
    await BOM.findOneAndDelete({
      parentItem: req.params.itemId,
    });

    res.json({ message: "BOM deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};