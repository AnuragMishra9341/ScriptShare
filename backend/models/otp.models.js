import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      index: { expires: 0 }, // ✅ auto delete per document
    },
  },
  { timestamps: true }
);

// 🔥 Fetch latest OTP fast
otpSchema.index({ email: 1, createdAt: -1 });


otpSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password =  await bcrypt.hash(this.password, 10);
  return next();
});

otpSchema.methods.generateJWT = function () {
  return jwt.sign({ email: this.email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const OTP =  mongoose.model("OTP", otpSchema);
