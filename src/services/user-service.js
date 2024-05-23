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

  signin: async (email, password, officeName) => {
    try {
      console.log("officename", officeName);
      const user = await userService.getUserByEmail(email);
      console.log("user data", user);
      console.log("Sign in request intitiated");
      if (!user) {
        throw { message: "No user found" };
      }

      // Find the office by name
      // const office = await userRepository.findBy({ office: officeName });
      // if (!office) {
      //   throw { message: "Office not found" };
      // }
      // Check if the user has access to the specified office
      if (user.office !== officeName) {
        throw { message: "User does not have access to this office" };
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

  getAllUsers: async () => {
    try {
      return await userRepository.findAll();
    } catch (error) {
      throw error;
    }
  },
};
module.exports = userService;