import Filter from "../models/filtersAPIModel.js";

const getFilterData = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    let sort = req.query.sort || "userId";
    let language = req.query.language || "All";

    const languagesOptions = ["Telugu", "English", "Hindi", "Tamil"];
    language === "All"
      ? (language = [...languagesOptions])
      : (language = req.query.language.split(","));
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const filteredData = await Filter.find({
      title: { $regex: search, $options: "i" },
    })
      .where("language")
      .in([...language])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await Filter.countDocuments({
      language: { $in: [...language] },
      title: { $regex: search, $options: "i" },
    });

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      language: languagesOptions,
      filteredData,
    };

    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // const testData = await Filter.find({});
  // console.log(testData);
};

export { getFilterData };
