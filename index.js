require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./routes");
const errorMiddleware = require("./middlewares/error-middleware");

const PORT = process.env.PORT || 5000;
const app = express();

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

const start = async () => {
  try {
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
