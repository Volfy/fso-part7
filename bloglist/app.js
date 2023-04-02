// eslint-disable-next-line no-unused-vars
const http = require("http");
const express = require("express");
require("express-async-errors");

const app = express();

const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const loginRouter = require("./controllers/login");
const userRouter = require("./controllers/users");
const blogRouter = require("./controllers/blogs");
const { errorHandler, tokenExtractor } = require("./utils/middleware");

mongoose.set("strictQuery", false);
mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use(tokenExtractor);
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testRouter = require("./controllers/testing");
  app.use("/api/testing", testRouter);
}

app.use(errorHandler);

module.exports = app;
