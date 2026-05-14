const Counter = require("../models/Counter");

const generateInvNumber = async (type) => {
  const prefixMap = {
    PART: "P-",
    SUBASSEMBLY: "SA-",
    ASSEMBLY: "A-",
  };

  const counter = await Counter.findOneAndUpdate(
    { type },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const prefix = prefixMap[type];

  return prefix + String(counter.seq).padStart(4, "0");
};