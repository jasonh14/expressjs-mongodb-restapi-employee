require("dotenv").config();
const path = require("path");
const { logger } = require("./middleware/logEvents");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOption");
const app = express();
const PORT = process.env.PORT || 3500;
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn.js");
const credentials = require("./middleware/credentials");
const employees = require("./model/employees.json");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");

//connect to DB
connectDB();

// custom middleware logger
app.use(logger);

app.use(credentials);
// cross origin resource sharing
app.use(cors(corsOptions));

// built in middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static file
app.use(express.static(path.join(__dirname, "/public")));

// routes
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    console.log("html", req.accepts("html"));
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
