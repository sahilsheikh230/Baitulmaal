const transporter  = require("./EmailConfig.js");

const sendVerificationCode = async (email) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const info = await transporter.sendMail({
      from: '"Baitulmaal" <sahilsheikh1045@gmail.com>',
      to: email,
      subject: "Verify Your Email",
      html: `<p>Your OTP is: <strong>${verificationCode}</strong></p>`,
    });

    console.log("Email sent:", info.messageId);
    return verificationCode; // So you can store or use it later
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw err;
  }
};

module.exports = sendVerificationCode;
