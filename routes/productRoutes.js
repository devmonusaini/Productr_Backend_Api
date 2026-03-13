import express from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  togglePublishProduct
} from "../controller/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/create-product",authMiddleware, upload.array("productImage"), createProduct);

router.get("/products", getAllProducts);

router.put("/update-product/:id", authMiddleware, upload.array("productImage", 5), updateProduct);

router.delete("/delete-product/:id", authMiddleware, deleteProduct);

router.patch("/toggle-product/:id", authMiddleware, togglePublishProduct);

export default router;