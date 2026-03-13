import Product from "../Models/productModel.js";


export const createProduct = async (req, res) => {
  try {

    const {
      productName,
      description,
      price,
      mrp,
      quantity,
      brandName,
      category,
      exchangeEligibility
    } = req.body;

    if (!productName || !price || !mrp || !quantity) {
      return res.status(400).json({
        success: false,
        message: "productName, price, mrp, and quantity are required"
      });
    }

    const images = req.files ? req.files.map(file => file.filename) : [];

    const product = await Product.create({
      userId: req.user.id,
      productName,
      description,
      price,
      mrp,
      quantity,
      brandName,
      category,
      productImage: images,
      exchangeEligibility,
      status: "published"
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const getAllProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    // collect fields from body
    const {
      productName,
      description,
      price,
      mrp,
      quantity,
      brandName,
      category,
      exchangeEligibility,
      status
    } = req.body;

    // build image list: existingImages may be string(s) containing full urls
    let images = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = req.body.existingImages.map(img => img.split("/").pop());
      } else {
        images = [req.body.existingImages.split("/").pop()];
      }
    }

    // include newly uploaded files
    if (req.files && req.files.length > 0) {
      images = images.concat(req.files.map(f => f.filename));
    }

    const updatePayload = {
      productName,
      description,
      price,
      mrp,
      quantity,
      brandName,
      category,
      exchangeEligibility,
      status,
      productImage: images,
      userId: req.user.id // ensure userId stays attached
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updated
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const deleteProduct = async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const togglePublishProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    product.status =
      product.status === "published" ? "unpublished" : "published";

    await product.save();

    res.json({
      success: true,
      message: "Product status updated",
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};