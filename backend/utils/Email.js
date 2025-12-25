import SibApiV3Sdk from "sib-api-v3-sdk";

// Configure Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async (userEmail, otp) => {
  try {
    // console.log(" Sending email to:", userEmail);

    const api = new SibApiV3Sdk.TransactionalEmailsApi();

    const response = await api.sendTransacEmail({
      sender: {
        name: "ShareScript",
        email: process.env.EMAIL_USER, // works FREE, no domain needed
      },
      to: [{ email: userEmail }],
      subject: "Verify your email (OTP)",
      htmlContent: `
        <h2>Email Verification</h2>
        <h1>${otp}</h1>
        <p>Valid for 15 minutes</p>
      `,
    });

    // console.log(" Brevo response:", response);
    return response;

  } catch (error) {
    console.error(" BREVO EMAIL ERROR:", error);
    throw new Error(error.message || "Failed to send email");
  }
};
