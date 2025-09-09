const { User } = require("../models/user");

const userRepository = {
  create: async (data) => {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error) {
      console.log(
        "Something went wrong in the create - userRepository repository layer"
      );
      throw error;
    }
  },

  findBy: async (data) => {
    try {
      const response = await User.findOne(data);
      console.log("response ky arha ", response);
      return response;
    } catch (error) {
      console.log(
        "Something went wrong in the findBy - userRepository repository layer"
      );
      throw error;
    }
  },

  findAll: async () => {
    try {
      return await User.find({});
    } catch (error) {
      console.log(
        "Something went wrong in the findAll - userRepository repository layer"
      );
      throw error;
    }
  },
};

module.exports = userRepository;
