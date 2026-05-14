// Create,Send and Save the Token in Cookie

const sendToken = (user, statusCode, res) => {
  //Create JWT Token

  const token = user.getJwtToken();

  //Option for Cooke

  // const options = {

  //   expires: new Date(
  //     Date.now() + 7 * 24 * 60 * 60 * 100
  //   ),
  //   httpOnly: true
  // }

    // Cookie Options
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,       // Restrict access to HTTP(S) requests
    secure: process.env.NODE_ENV === "production", // Secure cookie for production
    sameSite: 'Lax',      // Prevent CSRF attacks
  };

  console.log("token1",token);

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("type", "user", options)
    .json({
      success: true,
      message: "Login successfully",
      user: user,
      token:token
    });
};

module.exports = sendToken;
