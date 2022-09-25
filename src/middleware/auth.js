const bookModel = require("../models/bookmodel")
const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");

let authentication = function (req, res, next) {

    
    try {

        let token = req.headers["x-api-key"];
        if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

        jwt.verify(token, "group-0-secretkey", (error, decodedToken) => {
            if (error) {
                let message = (error.message == "jwt expired" ? "token is expired ,please login again" : "token is invalid,please recheck your token")
                return res.status(401).send({ status: false, msg: message })
            }
            console.log(decodedToken)
            req.decodedToken = decodedToken;
            next();
        });

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}

let authorisation = async function (req, res, next) {

    try {

        let userIdFromToken = req.decodedToken["authorId"]
        let userIdFromClient = req.params.bookId

        if (userIdFromClient) {

            if (!mongoose.Types.ObjectId.isValid(userIdFromClient)) return res.status(400).send({ msg: "blogId is InValid", status: false })
            let findUserDoc = await bookModel.findById(userIdFromClient)
            if (!findUserDoc) return res.status(404).send({ msg: "No user resister", status: false })
            if (userIdFromToken !== findUserDoc.userId.toString()) return res.status(403).send({ msg: "user is not Authorised for this operation", status: false })
            next()
        }
        return res.send({ status: false, msg: "Please provide BlogID" })

    } catch (err) {
        return res.status(500).send({ msg: err.message, status: false })
    }
}

module.exports.authentication = authentication;
module.exports.authorisation = authorisation