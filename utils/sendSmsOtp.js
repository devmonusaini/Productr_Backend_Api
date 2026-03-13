import twilio from "twilio";

export const sendSmsOtp = async (phone, otp) => {
  try {

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      to: phone, // user phone number
      from: process.env.TWILIO_PHONE // your Twilio number
    });

    console.log("SMS sent:", message.sid);

  } catch (error) {

    console.error("Twilio SMS Error:", error.message);

  }
};