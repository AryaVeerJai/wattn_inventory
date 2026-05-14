module.exports = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch((error) => {
    console.log(error);
    if (
      error?.keyValue?.email != null &&
      error?.name === "MongoError" &&
      error?.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "User with this email is already exist." },
      });
    } else if (
      error?.keyValue?.phoneNo != null &&
      error?.name === "MongoError" &&
      error?.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "User with this phone number is already exist." },
      });
    } else if (error.name === "MongoError" && error.code === 11000) {
      // Handle duplicate key error
      const duplicateKeyField = Object.keys(error.keyValue)[0];
      const errorMessage = `This ${duplicateKeyField} already exists.`;
      res
        .status(400)
        .json({ success: false, error: { message: errorMessage } });
    } else if (error.name === "ValidationError") {
      // Handle validation error for required fields
      const errorMessage = Object.values(error.errors)
        .map((fieldError) => fieldError.message)
        .join(". ");

      return res
        .status(400)
        .json({ success: false, error: { message: errorMessage } });
    } else {
      console.log(error);

      return res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
  });
