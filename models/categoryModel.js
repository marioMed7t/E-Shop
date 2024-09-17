const mongoose = require("mongoose");

//  1- Create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Required"],
      unique: [true, "category must be unique"],
      minlength: [3, "too short category name"],
      maxlength: [30, "too long category name"],
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
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

//findOne,findAll,Update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

//create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2- Create model
const CategoryModel = mongoose.model("category", categorySchema);

module.exports = CategoryModel;
