const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
//after createService function creation

//send verification code token
const sendVerification = async (req, res, number) => {
  client.verify.v2
    .services("VA438006354579c3f5e642588e561207f1")
    .verifications.create({ to: `${number}`, channel: "sms" })
    .then((verification) => console.log(verification.status));
};

//check verification token
const checkVerification = async (req, res, number, code) => {
  return new Promise((resolve, reject) => {
    client.verify.v2
      .services("VA438006354579c3f5e642588e561207f1")
      .verificationChecks.create({ to: `${number}`, code: `${code}` })
      .then((verification_check) => {
        console.log(verification_check);
        resolve(verification_check.status);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          success: false,
          error: {
            message: `Max OTP limit exceed`,
          },
        });
      });
  });
};
module.exports = {
  sendVerification,
  checkVerification,
};
