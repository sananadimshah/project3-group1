const bookModel = require("../models/bookmodel");
const userModel = require("../models/usermodel")
const reviewModel = require("../models/reviewmodel")
const moment = require("moment")
const { isValidRequestBody, isValid, isValidRegex1, isValidRegex2, isValidObjectId } = require("../validator/validator");
const { json } = require("express");


const createBooks = async function (req, res) {

    try {

        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "No parameter is found ,Plz provide detail" })

        // destructuring parameter of request body 

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt, reviews } = requestBody


        //----------------------------- Start Validation ----------------------------------------------

        if (!isValid(title)) return res.status(400).send({ status: false, msg: "title is required and it's must be string" })
        if (!isValidRegex1(title)) return res.status(400).send({ status: false, msg: "Invalid title" })

        if (!isValid(excerpt)) return res.status(400).send({ status: false, msg: "excerpt is required and it's must be string" })
        if (!isValidRegex1(excerpt)) return res.status(400).send({ status: false, msg: "Invalid excerpt" })

        if (!isValid(userId)) return res.status(400).send({ status: false, msg: "userId is required" })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Invalid userId" })

        if (!isValid(ISBN)) return res.status(400).send({ status: false, msg: "ISBN number is required and it's must be string" })
        if (!isValidRegex2(ISBN)) return res.status(400).send({ status: false, msg: "Invalid ISBN number" })

        if (!isValid(category)) return res.status(400).send({ status: false, msg: "category is required and it's must be string" })
        if (!isValidRegex1(category)) return res.status(400).send({ status: false, msg: "Invalid category" })

        if (!isValid(subcategory)) return res.status(400).send({ status: false, msg: "subcategory is required and it's must be string" })
        if (!isValidRegex1(subcategory)) return res.status(400).send({ status: false, msg: "Invalid subcategory" })

        if (!isValid(releasedAt)) return res.status(400).send({ status: false, msg: "releasedAt is required" })
        // if(!moment("DD-MM-YYYY").format(releasedAt)) return res.status(400).send({status : false , msg : "Date in format of DD-MM-YYYY"})
        // if(!moment(releasedAt).isBefore("DD-MM-YYYY")) return res.status(400).send({status : false , msg : "realised date is invalid"})

        if (reviews) {
            if (typeof reviews !== "number") return res.status(400).send({ status: false, msg: "reviews in Nuber type" })
            if (!/^[0-9]$/.test(reviews)) return res.status(400).send({ status: false, msg: "Invalid review Number" })
        }

        const isUniqueTitle = await bookModel.findOne({ title: title })
        if (isUniqueTitle) return res.status(409).send({ status: false, msg: "Title is already Exist" })

        const isIdreferUserModel = await userModel.findById(userId)
        if (!isIdreferUserModel) return res.status(400).send({ status: false, msg: "userId is not from user Collection" })

        const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isUniqueISBN) return res.status(409).send({ status: false, msg: "ISBN number is already exist" })

        //========================================== End Validation =======================================================

        const data = { title, excerpt, userId, ISBN, category, subcategory, releasedAt , reviews } // check when i not send released at then what happen

        const saveData = await bookModel.create(data)

        return res.status(201).send({ status: true, msg: "Book detail is successfully registered", data: saveData })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//============================================= GETALLBOOKS API ===============================//
const getallBook = async function (req, res) {

    try {

        let { userId, category, subcategory } = req.query
        let obj = { isDeleted: false }

        if (userId) {

            if (!isValid(userId)) return res.status(400).send({ status: false, msg: "userId must be string" })
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Invalid userId" })

            const isIdreferUserModel = await userModel.findById(userId)
            if (!isIdreferUserModel) return res.status(400).send({ status: false, msg: "userId is not from user Collection" })
            obj.userId = userId
        }
        if (category) {

            if (!isValid(category)) return res.status(400).send({ status: false, msg: "category must be string" })
            if (!isValidRegex1(category)) return res.status(400).send({ status: false, msg: "Invalid category" })
            obj.category = category
        }
        if (subcategory) {
            if (!isValid(subcategory)) return res.status(400).send({ status: false, msg: "subcategory must be string" })
            if (!isValidRegex1(subcategory)) return res.status(400).send({ status: false, msg: "Invalid subcategory" })
            obj.subcategory = subcategory
        }
        
        let listOfbook = await bookModel.find(obj).select({isDeleted : 0 ,  subcategory : 0, ISBN : 0 ,createdAt : 0 ,updatedAt : 0 ,__v : 0}).sort({ title: -1 })
        if (listOfbook.length == 0) {
            return res.status(404).send({ status: false, msg: "no document found" })
        }

        return res.status(200).send({ status: true, message: 'Books list', Data: listOfbook  })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}
//==============================================GETBOOKBYID API ==============================//
const getBooksById = async function (req, res) {

    try {

        const bookId = req.params.bookId;
        
        if(!isValidRequestBody(req.params)) res.status(400).send({status : false , msg : "No parameter found"})
        if (!isValid(bookId)) return res.status(400).send({ status: false, msg: "bookId is required" })
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "invalid bookId" })
        }

        const foundedBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({__v : 0})
        console.log(foundedBook)

        if (!foundedBook) {
            return res.status(404).send({ status: false, message: "book not found" })
        }
        const availableReviews = await reviewModel.find({ bookId: foundedBook._id, isDeleted: false })
            .select({ isDeleted: 0})
        let found = JSON.parse(JSON.stringify(foundedBook))

        if(availableReviews.length==0){
            found["reviewsData"] = []
            return res.status(200).send({status : true , data : found})
        }
        found["reviewData"] = availableReviews  
        return res.status(200).send({ status: true, message: "Books list", data: found })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
}

//========================================== UPDATE BOOK API ========================//
const updatebooks = async function (req, res) {

    try {

        let bookId = req.params.bookId;

        if (!isValid(bookId)) return res.status(400).send({ status: false, msg: "bookId is required" })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "Invalid userId" })

        //    if (!bookId) return res.status(400).send("bookId is required")
        // validatBookID = mongoose.Types.ObjectId.isValid(bookId)
        // if (!validatBookID) { return res.status(404).send({ status: false, msg: " require a valid Id" }); }
        let bookDetails = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookDetails) {
            return res.status(404).send({ status: false, msg: "no such book  exist" });
        }

        if (!isValidRequestBody(req.body)) return res.status(200).send({ status: true, msg: "No such thing You are Update", data: bookDetails })

        let { title, excerpt, ISBN,releasedAt } = req.body;
        let obj = {}

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, msg: "title it's must be string" })
            if (!isValidRegex1(title)) return res.status(400).send({ status: false, msg: "Invalid title" })
            const isUniqueTitle = await bookModel.findOne({ title: title })
           if (isUniqueTitle) return res.status(409).send({ status: false, msg: "Title is already Exist" })

            obj["title"] = title

        }
        if (excerpt) {
            if (!isValid(excerpt)) return res.status(400).send({ status: false, msg: "excerpt it's must be string" })
            if (!isValidRegex1(excerpt)) return res.status(400).send({ status: false, msg: "Invalid title" })
            obj["excerpt"] = excerpt

        }
        if (ISBN) {
            if (!isValid(ISBN)) return res.status(400).send({ status: false, msg: "ISBN number is required and it's must be string" })
            if (!isValidRegex2(ISBN)) return res.status(400).send({ status: false, msg: "Invalid ISBN number" })
            const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
            if (isUniqueISBN) return res.status(409).send({ status: false, msg: "ISBN number is already exist" })

            obj["ISBN"] = ISBN

        }
        if(releasedAt){
            obj["releasedAt"] = releasedAt
        }
        
        let updatebook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: obj }, { new: true })
        res.status(200).send({ status: true, message: 'Successfully Document Update', data: updatebook });

    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//============================================ DELETE BYID =============================//
const deletebyId = async function (req, res) {

    try {

        let bookId = req.params.bookId

        if (!isValid(bookId)) return res.status(400).send({ status: false, msg: "bookId is required" })
        if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, msg: "This is invalid bookId" }) }

        let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookData) {
            return res.status(404).send({ status: false, msg: "This bookId does not exit" })
        }

        let getbookDoc = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true , deletedAt : new Date()} }, { new: true })
        return res.status(200).send({ status: true, message: "Successfully Document Deleted" })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
 console.log("gautam")


module.exports = { createBooks, deletebyId, getallBook, getBooksById, updatebooks }


