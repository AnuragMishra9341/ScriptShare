import nodemailer from "nodemailer";

export const sendEmail = async (userEmail,otp) => {
 try {
   // 1. Create transporter
  // let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
 host: "smtp.gmail.com",
  port: 465,
  secure: true, // IMPORTANT
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // app password from Google

    },
  });

  // 2. Mail options
  const mailOptions = {
    from: `"ShareScript" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify your email (OTP)",
    text: `Your OTP is ${otp}. It is valid for 15 minutes.`,
    html:`
    <div style="font-family: Arial, sans-serif;">
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>                   
      <h1 style="letter-spacing: 3px;">${otp}</h1>
      <p>This OTP is valid for <b>15 minutes</b>.</p>
      <p>If you didn’t request this, please ignore this email.</p>
    </div>
  `,
  };

  // 3. Send email
  const info = await transporter.sendMail(mailOptions);

  return {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
    };



  // console.log(info)
  // console.log("Message sent:", info.messageId);

  // //  This gives you the preview link
  // console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  // console.log("Email sent:", info.response);
 } catch (error) {
     throw new Error("Failed to send email");
 }
};
