const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name Required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email Required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      required: [true, "Password Required"],
      minlength: [6, "Too short password"],
    },
    passwordChangeAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    //child refrence (one to many )
    wishlist: [{ type: mongoose.Schema.ObjectId, ref: "product" }],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        detalis: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  //hashing user password

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

module.exports = mongoose.model("User", userSchema);
