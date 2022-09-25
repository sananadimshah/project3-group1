const express = require("express")
const router = express.Router();
const userController= require("../controller/userController")
const bookController=require("../controller/bookController")
const reviewController = require("../controller/reviewController")
const {authentication,authorisation}=require("../middlewares/auth")

//=============================== CreateUser =======================================//
router.post("/register",userController.CreateUser)

//================================= LoginUser ======================================//
router.post("/login", userController.loginUser)

//=============================== Registered a book ================================//
router.post("/books", authentication,authorisation,bookController.createBooks)

//=============================== Get list of Book =================================//
router.get("/books",authentication,bookController.getallBook)

//=============================== Gets Books By Id =================================//
router.get("/books/:bookId" ,authentication,bookController.getBooksById)

//=============================== Update Book ======================================//
router.put("/books/:bookId",authentication,authorisation,bookController.updatebooks)

//=============================== Delete Book =====================================//
router.delete("/books/:bookId",authentication,authorisation,bookController.deletebyId)

//================================ Create Review ==================================//
router.post("/books/:bookId/review",reviewController.CreateReview)

//=============================== UpdateReview ====================================//
router.put("/books/:bookId/review/:reviewId" , reviewController.updateReview)

//=============================== Delete Review ===================================//
router.delete("/books/:bookId/review/:reviewId" , reviewController.deleteReview)


module.exports = router;

