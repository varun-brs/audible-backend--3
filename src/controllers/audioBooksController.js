import AudioBook from "../models/audioBooksModel.js";
import User from "../models/usersModel.js";

const createAudioBook = async (req, res, next) => {
  const { book_name, category, language, description } = req.body;

  try {
    if (!book_name || !category || !language) {
      const err = new Error("book_name, category, language is required");
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    // Save Audio_Book to DB
    await AudioBook.create({
      book_name,
      category,
      language,
      description,
      author_first_name: user.first_name,
      author_id: user._id,
    });

    // const audiobook = {
    //   book_name,
    //   category,
    //   language,
    //   author_first_name: user.first_name,
    //   author_id: user._id,
    // };

    res.status(201).json({
      message: "Your Audio Book Created Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const getAudioBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    const author_id = user._id;

    const audioBooksList = await AudioBook.find({ author_id });

    res.status(200).json(audioBooksList);
  } catch (error) {
    return next(error);
  }
};

const searchAudioBooks = async (req, res, next) => {
  const searchQuery = req.query.q?.toLowerCase(); // Get the search query parameter

  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    // Perform a case-insensitive search on both title and author fields
    const results = await AudioBook.find({
      $or: [
        { book_name: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search for title
        // Case-insensitive search for author
      ],
    });

    if (results.length > 0) {
      return res.json(results);
    } else {
      return res.status(404).json({ message: "No audiobooks found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error searching audiobooks" });
  }
};

const updateAudioBook = async (req, res, next) => {
  const { book_name, category, language, description } = req.body;
  const { id } = req.params; // Get audiobook ID from URL params

  try {
    const book = await AudioBook.findById(id);

    if (!book) {
      return res.status(404).json({ message: "AudioBook not found" });
    }

    // Create an object with only the fields that are updated
    const updatedFields = {};
    if (book_name !== undefined) updatedFields.book_name = book_name;
    if (category !== undefined) updatedFields.category = category;
    if (language !== undefined) updatedFields.language = language;
    if (description !== undefined) updatedFields.description = description;

    // Perform update only with changed fields
    const updatedBook = await AudioBook.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true } // Returns the updated document
    );

    res.status(200).json({
      message: "AudioBook updated successfully",
      updatedBook,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAudioBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const audioBook = await AudioBook.findByIdAndDelete(id);

    if (!audioBook) {
      return res.status(404).json({ message: "AudioBook not found" });
    }

    res.status(200).json({ message: "AudioBook deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllAudioBooks = async (req, res, next) => {
  try {
    // Fetch all audio books
    const audioBooksList = await AudioBook.find();

    if (audioBooksList.length > 0) {
      res.status(200).json(audioBooksList);
    } else {
      res.status(404).json({ message: "No audiobooks found" });
    }
  } catch (error) {
    return next(error);
  }
};

const getBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.params; // Extract categoryCode from URL

    if (!category) {
      return res.status(400).json({ message: "Category code is required" });
    }

    // Find audiobooks with the given category code
    const books = await AudioBook.find({ category: category });

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No audiobooks found in this category" });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  createAudioBook,
  getAudioBooks,
  searchAudioBooks,
  updateAudioBook,
  deleteAudioBook,
  getAllAudioBooks,
  getBooksByCategory,
};
