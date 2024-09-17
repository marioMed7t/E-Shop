const stripe = require("stripe")(process.env.STRIPE_SECRET);

const asyncHandler = require("express-async-handler");
const factory = require("./handlerFactory");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const ApiError = require("../utils/apiError");

// @desc     Create cash order
// @route    Post /api/v1/orders/:cartId
// @access   protected/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  //app setting
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(
        `there is no such cart for this id : ${req.params.cartId}`,
        404
      )
    );
  }
  // 2) Get order price depend on cart price "cheack if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) after creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
// @desc     Get all orders
// @route    Get /api/v1/orders
// @access   protected/user-Admin-Manager
exports.getAllOrders = factory.getAll(Order);

// @desc     Get Specific order
// @route    Get /api/v1/orders
// @access   protected/user-Admin-Manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc     update order paid status to paid
// @route    Put /api/v1/orders/:id/pay
// @access   protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id : ${req.params.id}`,
        404
      )
    );
  }

  //update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({ Stuatus: "success", data: updatedOrder });
});

// @desc     update order delivered status
// @route    Put /api/v1/orders/:id/deliver
// @access   protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id : ${req.params.id}`,
        404
      )
    );
  }

  //update order to delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({ Stuatus: "success", data: updatedOrder });
});

// @desc     Get checkout session from stripe and send it as response
// @route    Get /api/v1/orders/checkout-session/:cartId
// @access   protected/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  //app setting
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(
        `there is no such cart for this id : ${req.params.cartId}`,
        404
      )
    );
  }
  // 2) Get order price depend on cart price "cheack if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3)check stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp", // العملة
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});
