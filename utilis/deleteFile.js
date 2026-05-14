const AWS = require('aws-sdk');
var fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = (file) =>
    new Promise((resolve, reject) => {

        const params = {
            // Bucket: 'tanzivamernnew', // pass your bucket name
            Bucket: 'tanzivamern', // pass your bucket name
            Key: file
        };
        s3.deleteObject(params, function (s3Err, data) {

            if (data) {
                console.log(`File deleted successfully at ${data}`)

                return resolve(data);



            }

            if (s3Err) {
                console.log(s3Err)
                return reject(s3Err)
            }
        });

    });
    // })



