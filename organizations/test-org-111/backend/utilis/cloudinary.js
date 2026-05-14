const cloudinary = require("cloudinary");
const streamifier = require("streamifier");

cloudinary.v2.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
});

module.exports = (image) =>
  new Promise((reject, resolve) => {
    console.log(image);
    let stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) {
          console.log(result)
          return resolve(result);
        } else {
          return reject(error);
        }
      },
      { resource_type: "auto", chunk_size: 100000000 }
    );

    streamifier.createReadStream(image.buffer).pipe(stream);
  });
