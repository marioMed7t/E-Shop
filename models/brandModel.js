const mongoose = require("mongoose");

//  1- Create schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand Required"],
      unique: [true, "brand must be unique"],
      minlength: [3, "too short brand name"],
      maxlength: [30, "too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

//findOne,findAll,Update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2- Create model
const BrandModel = mongoose.model("brand", brandSchema);

module.exports = BrandModel;
