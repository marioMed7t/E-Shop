const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");

const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc     Add product to cart
// @route    Post /api/v1/cart
// @access   private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  let { quantity } = req.body;
  if (!quantity) {
    quantity = 1;
  }
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ApiError(`No document for this id ${productId}`, 404));
  }
  //1) Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    //create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        { product: productId, quantity, color, price: product.price },
      ],
    });
  } else {
    //product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += quantity;
      cart.cartItems[productIndex] = cartItem;
    } else {
      //product not exist in cart, push product in cartItems array
      cart.cartItems.push({
        product: productId,
        quantity,
        color,
        price: product.price,
      });
    }
  }
  //calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    Status: "success",
    message: "product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc     Get logged user cart
// @route    Get /api/v1/cart
// @access   private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    next(
      new ApiError(`there is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc     Remove specific cart item
// @route    DELETE /api/v1/cart/:itemId
// @access   private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc     clear logged user cart
// @route    Get /api/v1/cart
// @access   private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc     Update specific cart item quantity
// @route    Put /api/v1/cart/:itemId
// @access   private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`there is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there is no item for this id : ${req.params.itemId}`, 404)
    );
  }
  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc     Apply coupon on logged user cart
// @route    Put /api/v1/cart/applyCoupon
// @access   private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`, 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice;

  // 3) calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
