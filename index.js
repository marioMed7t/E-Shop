const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const dbConnection = require("./config/database");

const globalError = require("./middlewares/errorMiddleware");
// Mount Route
const mountRoutes = require("./routes/index");

// connect with Database
dbConnection();

// Express App
const app = express();

//enable other domain to access your app
app.use(cors());
app.options("*", cors());

// compress all response
app.use(compression());

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode : ${process.env.NODE_ENV}`);
}

// Mount Route
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this Route: ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

const { PORT } = process.env;

const server = app.listen(PORT, () => {
  console.log(`App running on Port ${PORT}`);
});

// Events => listen ==> callback(err)
// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shotting down....`);
    process.exit(1);
  });
});
