import { User } from "../Models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Book } from "../Models/bookSchema.js";

// add new user function
export const addUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, books } = req.body;

    if (!name && !email) {
      return next(new ErrorHandler("Please fill in all fields", 400));
    }
    const user = await User.create({ name, email, books });

    console.log("user>>>",  user.books[0]);
    let book = await Book.find({_id: user.books[0]});
    console.log("book>>>", book);


    res.status(201).json({
      succsess: true,
      message: "User Created",
      user,
    });
  } catch (error) {
    console.log(error);

    res.send(error);
  }
});

// get all user function

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});
