import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  mrp: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  brandName: {
    type: String,
  },

  category: {
    type: String,
  },

  productImage: [
    {
      type: String,
    },
  ],

  exchangeEligibility: {
    type: String,
    enum: ["yes", "no"],
    default: "yes",
  },

  status: {
    type: String,
    enum: ["published", "unpublished"],
    default: "unpublished",
  },
},
{ timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;