const userRepository = require('../repository/user-repository');

const userService = {
  signup: async (data) => {
    try {
      const user = await userRepository.create(data);
      return user;
    } catch (error) {
      console.log('Something went wrong in the sign user - service layer');
      console.log('Actual error:', error);
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const user = await userRepository.findBy({ email });
      return user;
    } catch (error) {
      console.log('Something went wrong in the user - service layer');
      console.log('Actual error:', error);
      throw error;
    }
  },

  signin: async (email, password) => {
    try {
      const user = await userService.getUserByEmail(email);
      console.log('user data', user);
      console.log('Sign in request intitiated');
      if (!user) {
        throw { message: 'No user found' };
      }

      if (!user.comparePassword(password)) {
        throw { message: 'Incorrect password' };
      }

      const token = user.genJWT();
      return { token, userDetails: user };
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (filters = {}) => {
    try {
      return await userRepository.findAll(filters);
    } catch (error) {
      throw error;
    }
  },
};
module.exports = userService;
