const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtpout.secureserver.net",
    port: 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `Khado Store <store@khadostore.com>`,
    to: options.email,
    subject: options.subject,
    // text: options.message,
    html: options.message,
  };
  await transport
    .sendMail(message)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = sendEmail;



//  To generate app password enavel 2FA in Google and go to this like: https://myaccount.google.com/apppasswords
