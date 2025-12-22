const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

const serveIndex = require('serve-index');
const path = require('path');
const fs = require('fs');

app.use(
  cors({
    credentials: true,
    origin: [
      // "http://admin.tanziva.com",
      // "http://tanziva.com",
      // "http://3.110.176.204",
      // "http://3.110.176.204:3000",
      "http://localhost:8000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:5500",
    ],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
//Import all routes
const auth = require("./routes/auth");
const seller = require("./routes/seller");
const product = require("./routes/product");
const material = require("./routes/material");
const category = require("./routes/category");
const attribute = require("./routes/attribute");
const cart = require("./routes/cart");
const wishlist = require("./routes/wishlist");
const address = require("./routes/address");
const order = require("./routes/order");
const coupon = require("./routes/coupon");
const brands = require("./routes/brands");
const color = require("./routes/color");
const review = require("./routes/review");
const shipping = require("./routes/shipping");
const home = require("./routes/home");
const upload = require("./routes/uploadRoute");


const dynamicRoutes = require('./routes/dynamicRoutes');
const dynamicPartRoutes = require('./routes/dynamicPartRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');

// const path = require("path");

//Setting Up Config File
if (process.env.NODE_ENV !== "production")
  require("dotenv").config({ path: "backend/config/config.env" });


// =================== FILE BROWSER SETUP ===================
const directoryPath = path.join(__dirname, 'uploads');

// Secure file browser middleware
const fileBrowserMiddleware = [
  // Authentication check - modify as needed
  (req, res, next) => {
    // Add your authentication logic here
    // Example: if (!req.user) return res.status(403).send('Forbidden');
    next();
  },
  express.static(directoryPath),
  serveIndex(directoryPath, {
    icons: true,
    view: 'details',
    filter: (filename) => {
      // Exclude hidden files and sensitive files
      return !filename.startsWith('.') && !filename.match(/^(config|secret)/i);
    }
  })
];

app.use("/api/v1", auth);
app.use("/api/v1", seller);
app.use("/api/v1", product);
app.use("/api/v1", material);
app.use("/api/v1", category);
app.use("/api/v1", attribute);
app.use("/api/v1", cart);
app.use("/api/v1", wishlist);
app.use("/api/v1", address);
app.use("/api/v1", order);
app.use("/api/v1", coupon);
app.use("/api/v1", brands);
app.use("/api/v1", color);
app.use("/api/v1", review);
app.use("/api/v1", shipping);
app.use("/api/v1", home);
app.use("/api/v1", upload);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/dynamicpart', dynamicPartRoutes);
app.use('/api/users', userRoutes)


app.use('/api/organizations', organizationRoutes);


app.use('/file-browser', ...fileBrowserMiddleware);

// Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(__basedir, '/uploads')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/v1/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/test-backend', (req, res) => {
  res.send('Hello from backend!');
});

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );
  next();
});
__dirname = path.resolve();
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "user/out")));
  app.use(express.static(path.join(__dirname, "admin/build")));

  // // ...
  // Right before your app.listen(), add this:
  app.get("/admin", (req, res) => {
    res.sendFile(path.resolve(__dirname, "admin", "admin", "index.html"));
  });
  // // ...
  // // Right before your app.listen(), add this:
  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "user", "out", "index.html"));
  // });

  
}
module.exports = app;
