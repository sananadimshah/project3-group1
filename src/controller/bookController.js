const bookModel = require("../models/bookmodel");
const userModel = require("../models/usermodel")
const moment = require("moment")
const { isValidRequestBody, isValid, isValidRegex1, isValidRegex2, isValidObjectId } = require("../validator/validator")


const createBooks = async function (req, res) {

    try {

        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "No parameter is found ,Plz provide detail" })

        // destructuring parameter of request body 

        const { title, excerpt, userId, ISBN, category, subcategory, reviews } = requestBody

        //----------------------------- Start Validation ----------------------------------------------

        if (!isValid(title)) return res.status(400).send({ status: false, msg: "title is required and it's must be string" })
        if (!isValidRegex1(title)) return res.status(400).send({ status: false, msg: "Invalid title" })

        if (!isValid(excerpt)) return res.status(400).send({ status: false, msg: "excerpt is required and it's must be string" })
        if (!isValidRegex1(excerpt)) return res.status(400).send * { status: false, msg: "Invalid excerpt" }

        if (!isValid(userId)) return res.status(400).send({ status: false, msg: "userId is required and it's must be string" })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Invalid userId" })

        if (!isValid(ISBN)) return res.status(400).send({ status: false, msg: "ISBN number is required and it's must be string" })
        if (!isValidRegex2(ISBN)) return res.status(400).send({ status: false, msg: "Invalid ISBN number" })

        if (!isValid(category)) return res.status(400).send({ status: false, msg: "category is required and it's must be string" })
        if (!isValidRegex1(category)) return res.status(400).send * { status: false, msg: "Invalid category" }

        if (!isValid(subcategory)) return res.status(400).send({ status: false, msg: "category is required and it's must be string" })
        if (!isValidRegex1(subcategory)) return res.status(400).send({ status: false, msg: "Invalid subcategory" }) // check subcategory array or string if array then changes

        if (reviews) {
            if (typeof reviews !== "number") return res.status(400).send({ status: false, msg: "reviews in Nuber type" })
            if (!/^[0-9]$/.test(reviews)) return res.status(400).send({ status: false, msg: "Invalid review Number" }) // change in regex
        }

        const isUniqueTitle = await bookModel.findOne({ title: title })
        if (isUniqueTitle) return res.status(409).send({ status: false, msg: "Title is already Exist" })

        const isIdreferUserModel = await userModel.findById(userId)
        if (!isIdreferUserModel) return res.status(400).send({ status: false, msg: "userId is not from user Collection" })

        const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isUniqueISBN) return res.status(409).send({ status: false, msg: "ISBN number is already exist" })

        const data = { title, excerpt, userId, ISBN, category, subcategory, releasedAt: moment().format("DD/MM/YYYY , h:mm:ss a"), reviews } // check when i not send released at then what happen

        const saveData = await bookModel.Create(data)

        return res.status(201).send({ status: true, msg: "Book detail is successfully registered", data: saveData })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const getallBook = async function (req, res) {
    try {
        let { userId, category, subcategory } = req.query
        let obj = { isDeleted: false }
        if (userId != null) { obj.userId = userId }
        if (category != null) { obj.category = category }
        if (subcategory != null) { obj.subcategory = subcategory }
        let listOfbook = await bookModel.find(obj).select({ subcategory: 0, ISBN: 0 }).sort({ title: 1 })
        if (listOfbook.length == 0) {
            return res.status(404).send({ status: false, msg: "no document found" })
        }
        return res.status(200).send({
            status: true,
            message: 'Books list', Data: {listOfbook}
        })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}
const updatebooks= async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (!bookId) return res.status(400).send("bookId is required")
        validatBookID = mongoose.Types.ObjectId.isValid(bookId)
        if (!validatBookID) { return res.status(404).send({ status: false, msg: " require a valid Id" }); }
        let bookDetails = await bookModel.findById(bookId);
        if (!bookDetails) {
            return res.status(404).send({ status: false, msg: "no such book  exist" });
        }
        let { title, excerpt, ISBN } = req.body;
        let obj = {}
        if (title !== null) { obj.title = title }
        if (excerpt !== null) { obj.excerpt = excerpt }
        // if (releasedAt !== null) { obj.releasedAt = releasedAt }
        if (ISBN !== null) { obj.ISBN = ISBN }
        let updatebook = await blogmodel.findOneAndUpdate({ _id: bookId }, { $set: { obj, releasedAt: moment().format("DD/MM/YYYY , h:mm:ss a") } }, {  new: true })
        if (updatebook.isDeleted == true) return res.status(404).send({ 
            status: false,
            message: "books not found"
        })
        res.status(200).send({
            status: true,
            message: 'Success',
            data: {
                updatebook
            }
});
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


module.exports = { createBooks, getallBook, updatebooks }