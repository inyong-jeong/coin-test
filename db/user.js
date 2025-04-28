const User = require('../models/User')

 const getUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    return user;
  };

const createUser = async (
    username,
    email,
    password,
    role
  ) => {
    const user = await User.create({
      username,
      email,
      password,
      role
    });
    return user;
  };


  module.exports = {
    getUserByEmail,
    createUser
  }