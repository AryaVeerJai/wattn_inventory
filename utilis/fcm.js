var FCM = require("fcm-node");
var serverKey =
  ""; //put your server key here
var fcm = new FCM(serverKey);

module.exports = (token, title, body, data) =>
  new Promise((reject, resolve) => {
    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      registration_ids: token,

      notification: {
        title: title,
        body: body,
      },

      data: data,
    };

    fcm.send(message, function (err, response) {
      if (err) {console.log(err)
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);

        return resolve(response);
      }
    });
  });
