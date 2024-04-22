const userRepository = require("../repository/user-repository");

const userService = {
  signup: async (data) => {
    try {
      const user = await userRepository.create(data);
      return user;
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const user = await userRepository.findBy({ email });
      return user;
    } catch (error) {
      throw error;
    }
  },

  signin: async (email, password) => {
    try {
      const user = await userService.getUserByEmail(email);
      console.log("Sign in request intitiated");
      if (!user) {
        throw { message: "No user found" };
      }

      if (!user.comparePassword(password)) {
        throw { message: "Incorrect password" };
      }

      const token = user.genJWT();
      return token;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = userService;
