const reviewModel = require("../models/reviewmodel")
const bookModel = require("../models/bookmodel")
const userModel = require("../models/usermodel")
const { isValid, isValidObjectId, isValidRegex1, isValidRequestBody } = require("../validator/validator")
const moment = require("moment")

//========================================= CREATE REVIEW API ==============================//
const CreateReview = async function (req, res) {

    try {

        let bookid = req.params.bookId
        
        if (!isValidObjectId(bookid)) {
            return res.status(400).send({ status: false, msg: "This is invalid bookId" })
        }

        let bookId = await bookModel.findOne({ _id: bookid, isDeleted: false })

        if (!bookId) {
            return res.status(404).send({ status: false, msg: "This bookId does not exit , Its already deleted" })
        }
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "please send Rewiew for book" })
        }

        let { reviewedBy, rating, review } = req.body

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "Please provide reviewedBy its required and must be in correct format" })
        }
        if (typeof rating !== "number") {
            return res.status(400).send({ status: false, msg: "Please provide rating its required and must be in correct format" })
        }
        if(!/^[0-9]$/.test(rating)){
            return res.status(400).send({status : false , msg : "rating Must be Integer"})
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, msg: "rating should be min 1 and max 5" })
        }
        if (!isValid(review)) {
            return res.status(400).send({ status: false, msg: " Please provide review its required and must be in correct format" })
        }

        const saveData = { bookId: bookid, reviewedBy, reviewedAt: new Date(), rating, review }

        let Updatereview = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } })
        let rewiewData = await reviewModel.create(saveData)

        return res.status(200).send({ status: true, message: "Success", data: rewiewData })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
// ### POST /books/:bookId/review
// - Add a review for the book in reviews collection.
// - Check if the bookId exists and is not deleted before adding the review. Send an error response with appropirate status code like [this](#error-response-structure) if the book does not exist
// - Get review details like review, rating, reviewer's name in request body.
// - Update the related book document by increasing its review count
// - Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)
// ```yaml
// // {
// //   "_id": ObjectId("88abc190ef0288abc190ef88"),
// //   bookId: ObjectId("88abc190ef0288abc190ef55"),
// //   reviewedBy: "Jane Doe",
// //   reviewedAt: "2021-09-17T04:25:07.803Z",
// //   rating: 4,
// //   review: "An exciting nerving thriller. A gripping tale. A must read book."
// // }
//============================================== UPDATE REVIEW API ============================//
const updateReview = async function (req, res) {

    try {

        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        
        // if(Object.values(req.params).length==0) res.status(400).send({status : false , msg : "Please Provide Detail"})
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "invalid BookId" })

        const requiredBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!requiredBook) return res.status(404).send({ status: false, message: "No Such book present" })

        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "invalid reviewId" })
        const requiredReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!requiredReview) return res.status(404).send({status: false, message: "No any review of the book"})

        if(!isValidRequestBody(req.body)) return res.status(400).send({status : false , msg : "No review Update , please provide review upadate detail"})

        let { reviewedBy, rating, review } = req.body
        let obj = {reviewedAt : new Date()}
        
        if(reviewedBy){

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "Please provide reviewedBy its required and must be in correct format" })
        }
        obj.reviewedBy = reviewedBy
    }
        if(rating){

        if (typeof rating !== "number") {
            return res.status(400).send({ status: false, msg: "Please provide rating its required and must be in correct format" })
        }
        if(!/^[0-9]$/.test(rating)){
            return res.status(400).send({status : false , msg : "rating Must be Integer"})
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, msg: "rating should be min 1 and max 5" })
        }
        obj.rating = rating
    }
        if(review){
            
            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: " Please provide review its required and must be in correct format" })
            }
            obj.review = review
        }

        const updateReview =  await reviewModel.findByIdAndUpdate({_id :reviewId},{$set :obj},{new : true});

        // updateReview.bookId = bookId
        let combineBookRewiew = requiredBook.toObject()// convert into object //moogose function
        combineBookRewiew["reviewData"] = updateReview

        return res.status(200).send({status : true , msg : "Update Success Done", data : combineBookRewiew})

    }catch(err){
        return res.status(500).send({status : false , msg : err.message})
    }
}

//================================================ DELETE REVIEW API ============================//
const deleteReview = async function (req, res) {

    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "invalid BookId" })

        const requiredBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!requiredBook) return res.status(404).send({ status: false, message: "No Such book present" })

        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "invalid reviewId" })
        const requiredReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!requiredReview) return res.status(404).send({status: false, message: "No any review of the book"})

        // let reviewDetails = await reviewModel.findOne({ bookId: bookid, _id: reviewid, isDeleted : false });
        // if (!reviewDetails) {
        //     return res.status(404).send({ 
        //         status: false,
        //         message: "No review is there"
        //  });
        // }

      let updateData  = await reviewModel.findOneAndUpdate( { _id : reviewId , isDeleted: false}, {$set: { isDeleted : true} }, { new: true })
      let book = await bookModel.findByIdAndUpdate( {_id: bookId},{$inc: {reviews:-1}},{new : true})
      
      
      return res.status(200).send({ status: true, msg: updateData });

        
    }
    catch (err) {

        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}


        // Get review details like review, rating, reviewer's name in request body.
        // - Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like [this](#book-details-response)
        

 module.exports = { CreateReview , updateReview , deleteReview}