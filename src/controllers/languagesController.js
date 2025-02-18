import Language from "../models/languagesModel.js";
const getLanguages = async (req, res, next) => {
  try {
    const language = await Language.find();
    res.status(200).json(language);
  } catch (e) {
    return next(e);
  }
};

const addLanguages = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await Language.create({ ...data });
    res.status(200).send(user);
  } catch (error) {
    return next(error);
  }
};

export { getLanguages, addLanguages };
