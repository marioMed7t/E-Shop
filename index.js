const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const dbConnection = require("./config/database");

const globalError = require("./middlewares/errorMiddleware");
// Mount Route
const mountRoutes = require("./routes/index");
const { webhookCheckout } = require("./services/orderService");

// connect with Database
dbConnection();

// Express App
const app = express();

//enable other domain to access your app
app.use(cors());
app.options("*", cors());

// compress all response
app.use(compression());

//checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middleware
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode : ${process.env.NODE_ENV}`);
}

// To apply data sanatization
app.use(mongoSanitize());

// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter);

//middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp({ whitelist: ["price", "sold", "quantity", "ratingsQuantity"] }));

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
