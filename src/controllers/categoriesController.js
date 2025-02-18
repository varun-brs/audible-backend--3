import Category from "../models/categoriesModel.js";

const getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const category = await Category.create({ ...data });
    console.log(category.name);
    res.status(200).send(category.name);
  } catch (e) {
    return next(e);
  }
};

// Get all active categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: true }).select("name");
    res.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
};

export { addCategory, getCategory, getCategories };
