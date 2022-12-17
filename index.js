require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./routes");
const errorMiddleware = require("./middlewares/error-middleware");
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 5000;
const app = express();
const fs = require("fs");

app.use(fileUpload({}));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors([
    {
      credentials: true,
      origin: "http://localhost:3000/",
    },
  ])
);
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use(express.static("files"));
app.use("/files", express.static("files"));
app.use(errorMiddleware);

console.log(process.cwd());
const start = async () => {
  try {
    fs.mkdirSync(`${process.cwd()}\\files`, { recursive: true });
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(5000, () => console.log(`Server started on PORT=${PORT}`));
  } catch (err) {
    console.log(err);
  }
};

start();
