const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const User = require("../models/user");

userRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", { user: 0, likes: 0 });
  res.json(users);
});

userRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "both username and password are required" });
  }
  if (username.length < 3 || password.length < 3) {
    res
      .status(400)
      .json({
        error: "username and password must be at least 3 characters long",
      });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = userRouter;
