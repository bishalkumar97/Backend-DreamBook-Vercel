const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');
const { fileUploadService } = require('../microservices');

const searchQuery = (search, field) => {
    return [{ [field]: { $regex: search, $options: 'i' } }];
  };
  

const addBook = catchAsync(async (req, res) => {
    if (req.body.platforms) {
        req.body.platforms = JSON.parse(req.body.platforms);
    }
    if (req.file) {
        const [coverImage] = await fileUploadService.s3Upload([req.file], 'coverImages').catch(err => {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture');
        });
        // let book = await bookService.addBook({ ...req.body, coverImage })
        let book = await bookService.addBook({ ...req.body, coverImage, source: req.body.source || "manual" })

        return res.status(200).send({ status: true, message: "Book added successfully", data: book });
    } else {
        return res.status(400).json({ status: false, message: "Please pass cover image" })
    }
});

const getAllBooks = catchAsync(async (req, res) => {
    try {
        console.log("Request headers:", req.headers);
        console.log("User data:", req.user);
        
        const user = req.user || {};
        const populateConfig = [
            { path: "author", select: "_id name email" }
        ];

        // Only filter by author if user is an author
        const query = { ...req.query };
        if (user.role === "author") {
            query.author = user._id;
        }

        // Get total count before pagination
        const totalCount = await bookService.getTotalBooksCount(query);
        const books = await bookService.getAllBooks(query, populateConfig);
        
        console.log("Total books:", totalCount);
        console.log("Books in current page:", books?.length || 0);

        res.status(200).json({
            status: true,
            message: 'Books fetched successfully',
            data: books,
            page: parseInt(query.page) || 1,
            limit: parseInt(query.limit) || 10,
            totalResults: totalCount // Use the total count instead of current page length
        });
    } catch (error) {
        console.error("Error in getAllBooks:", error);
        res.status(500).json({
            status: false,
            message: error.message || 'Error fetching books',
            data: []
        });
    }
});

const getBookById = catchAsync(async (req, res) => {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
        return res.status(400).json({
            status: false,
            message: "Book not foud"
        })
    }
    // return res.status(200).json({
    //     status: true,
    //     message: "Book details",
    //     data: book
    // })

    return res.status(200).json({
        status: true,
        message: "Book details",
        data: {
            // id: book._id,
            // title: book.title,
            // author: book.author,
            // source: book.source,  // ✅ Ensure source is returned
            // coverImage: book.coverImage,
            // platforms: book.platforms,
            id: book._id,
      title: book.title,
      author: book.author,
      subtitle: book.subtitle,
      isbnNumber: book.isbnNumber,
      categories: book.categories,
      coverImage: book.coverImage,
      bindingSize: book.bindingSize,
      language: book.language,
      price: book.price,
      platforms: book.platforms,
      source: book.source,
      status: book.status,
      description: book.description
        }
    })
    
})

const updateBookById = catchAsync(async (req, res) => {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
        return res.status(400).json({
            status: false,
            message: "Book not foud"
        })
    }
    if (req.file) {
        const [coverImage] = await fileUploadService.s3Upload([req.file], 'coverImages').catch(err => {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture');
        });
        req.body = { ...req.body, coverImage }
    }
    if (req.body.platforms) {
        req.body.platforms = JSON.parse(req.body.platforms);
    }
    // const updatedBook = await bookService.updateBookById(req.params.id, req.body);
    // const updatedBook = await bookService.updateBookById(req.params.id, {
    //     ...bookData._doc,  // Preserve existing data
    //     ...req.body,  // Update only the new fields
    //     source: bookData.source  // ✅ Ensure source is not removed
    // });
    const updatedBook = await bookService.updateBookById(req.params.id, {
        ...book._doc,
        ...req.body,
        source: book.source
      });
    return res.status(200).json({
        status: true,
        message: "Book updated successfully",
        data: updatedBook
    })
})

const deleteBookById = catchAsync(async (req, res) => {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
        return res.status(400).json({
            status: false,
            message: "Book not foud"
        })
    }
    // const deletedBook = await bookService.getBookById(req.params.id);
    await bookService.deleteBookById(req.params.id); // actual deletion
    return res.status(200).json({
        status: true,
        message: "Book deleted successfully",
        data: deletedBook
    })
})

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBookById,
    deleteBookById
}
