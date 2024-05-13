// src/controllers/user-controller.js

const userService = require("../services/user-service");

const signup = async (req, res) => {
  try {
    const user = await userService.signup({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || "user",
      office: req.body.office,
    });
    return res.status(201).json({
      success: true,
      message: "Successfully created a new user",
      data: user,
      err: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: {},
      err: error,
    });
  }
};

const login = async (req, res) => {
  try {
    const token = await userService.signin(
      req.body.email,
      req.body.password,
      req.body.office
    );
    return res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: token,
      err: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: {},
      err: error,
    });
  }
};

module.exports = { signup, login };
