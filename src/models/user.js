const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name cannot be empty"],
    },
    password: {
      type: String,
      required: [true, "Password cannot be empty"],
    },
    email: {
      type: String,
      required: [true, "Email cannot be empty"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin", "officeuser"],
      default: "user",
    },

    assignedOffice: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Hash the password before saving the user model
userSchema.pre("save", function (next) {
  const user = this;
  if (user.isModified('password')) {
    if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2a$')) {
      const SALT = bcrypt.genSaltSync(9);
      user.password = bcrypt.hashSync(user.password, SALT);
    }
  }
  next();
});

userSchema.methods.comparePassword = function compare(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.genJWT = function generate() {
  return jwt.sign({ id: this._id, email: this.email }, "IV_Secret", {
    expiresIn: "1h",
  });
};

const User = mongoose.model("User", userSchema);

// Add this function below your User model
async function updateUserDetails(userId, updateData) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (updateData.name) user.name = updateData.name;
  if (updateData.email) user.email = updateData.email;
  if (updateData.role) user.role = updateData.role;
  if (updateData.assignedOffice !== undefined) user.assignedOffice = updateData.assignedOffice;

  if (updateData.password) {
    const SALT = bcrypt.genSaltSync(9);
    user.password = bcrypt.hashSync(updateData.password, SALT);
  }

  await user.save();
  return user;
}

// Update your exports like this:
// console.log('Exporting updateUserDetails:', updateUserDetails);
module.exports = {
  User,
  updateUserDetails
};
