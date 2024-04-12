var createError = require("http-errors");
const helmet = require('helmet');
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var withAuth = require("./withAuth");
const cors = require('cors');

const db = require("./models");
require("dotenv").config();
const rateLimitMiddleware = require("./middleware/rateLimiter.middleware")

var api = require("./routes/api");
var login = require("./routes/login/login.routes");
var register = require("./routes/register/register.routes");

var app = express();

app.use(helmet());

// global.__basedir = __dirname;

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Apply the rate limiter to all routes
app.use(rateLimitMiddleware);
// app.use(express.static(path.join(__dirname, "public")));

// var corsOptions = {
//   origin: 'http://localhost:3000',
//   optionsSuccessStatus: 200
// }

db.sequelize.sync({ alter: true });

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
app.use(cors());


app.use("/api", api);
app.use("/login", login);
app.use("/register", register);

app.get("/checkToken", withAuth.checkToken);

// Serve static assets if in production
// if (process.env.NODE_ENV === "production") {
//   // Set static folder
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });


let server;
server = app.listen(3000, () => {
  console.log(`Listening to port ${3000}`);
});



module.exports = app;
