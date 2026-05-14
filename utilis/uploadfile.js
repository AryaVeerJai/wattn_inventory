const AWS = require('aws-sdk');
var fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = (file) =>
    new Promise((resolve, reject) => {
        // fs.readFile(file.fieldname, function (err, data) {
        //     if (err) {
        //         return reject(err)
        //     };
        const params = {
            // Bucket: 'tanzivamernnew', // pass your bucket name
            Bucket: 'tanzivamern', // pass your bucket name
            Key: file.originalname, // file will be saved as testBucket/contacts.csv
            Body: file.buffer
        };
        s3.upload(params, function (s3Err, data) {

            if (data) {
                console.log(`File uploaded successfully at ${data.Location}`)

                return resolve(data.Location);



            }

            if (s3Err) {
                console.log(s3Err)
                return reject(s3Err)
            }
        });

    });



