const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.register = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const { name, email, password, coSignerEmail } = req.body
    //check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: 'User already exists' })
    const user = new User({ name, email, password, coSignerEmail })
    await user.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
//get user profile
exports.getProfile = async (req, res) => {
    // #swagger.tags = ['Auth']
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
