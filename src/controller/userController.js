const jwt = require("jsonwebtoken");
const usermodel = require("../models/usermodel")
const { isValid, isValidEmailRegex, isValidPasswordRegex, isValidPhoneRegex, isValidRegex1 } = require("../validator/validator")

const CreateUser = async function (req, res) {

    let { title, name, phone, email, password , address} = req.body

    if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: "Data is required" })

    //============================== Title validation ==========================================//

    let requirefield = ["title", "name", "phone", "email", "password","address"]

    if (!isValid(title)) return res.status(400).send({ status: false, msg: "Please give title is not present in " })
    if (!["Mr", "Mrs", "Miss"].includes(title)) return res.status(400).send({ status: false, msg: `Title should be among Mr, Mrs, Miss` })

    //=============================== name validation==============================//

    if (!isValid(name)) return res.status(400).send({ status: false, msg: "Please give data in correct format" })
    if (!isValidRegex1(name)) return res.status(400).send({ status: false, msg: "invalid name" })

    //================================== password validation ====================================//

    if (!isValid(password)) {
        return res.status(400).send({ staus: false, msg: "Please give data in correct format" })
    }
    if (!isValidPasswordRegex(password)) {
        return res.status(400).send({ status: false, msg: "Password should be min 8 ans max 100 character.It containt atleast--> 1 Uppercase letter, 1 Lowercase letter, 1 Number, 1 Special character" })
    }

    //=============================email validation============================//

    if (!isValid(email)) {
        return res.status(400).send({ staus: false, msg: "Please give data in correct format" })
    }
    if (!isValidEmailRegex(email)) {
        return res.status(400).send({ status: false, msg: "EmailId is invalid" })
    }

    //==============================phone validation=========================//

    if (!isValid(phone)) {
        return res.status(400).send({ staus: false, msg: "Please give data in correct format" })
    }
    if (!isValidPhoneRegex(phone)) {
        return res.status(400).send({ status: false, msg: "Phone number is invalid" })
    }

    //======================================MongoDB data check==================================================

    let emailId = await usermodel.findOne({ email: email })
    if (emailId) {
        return res.status(400).send({ status: false, msg: "This is emailId is already taken" })
    }

    let phoneId = await usermodel.findOne({ phone: phone })
    if (phoneId) {
        return res.status(400).send({ status: false, msg: "This Phone number is already taken" })
    }

    //================================== End Validation ==========================================//

    const data = { title, name, phone, email, password, address}
    let savedata = await usermodel.create(data)
    res.status(201).send({ status: true, message: "Success user register", data: savedata })

}
//======================================== LOGIN API ===========================================//

const loginUser = async (req, res) => {

    try {

        let data = req.body

        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, msg: "incomplete request data, please provide more data" }) }

        let { email, password } = data

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "please enter your email" })
        if (!isValidEmailRegex(email)) return res.status(400).send({ status: false, msg: "please enter valid Email" })

        if (!isValid(password)) return res.status(400).send({ status: false, msg: "please enter your password" })
        if (!isValidPasswordRegex(password)) return res.status(400).send({ status: false, msg: "please enter valid password" })

        let user = await usermodel.findOne({ email: email, password: password });
        if (!user) return res.status(401).send({ status: false, msg: "your email or password is incorrect" })

        let token = jwt.sign(
            {
                authorId: user._id.toString(),
                
                team: "Group-01"
            }, "group-0-secretkey", {expiresIn : "300s"});
        let decoded = jwt.verify(token ,"group-0-secretkey" )

        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, msg: "login successful ", data : {token : token , iat : new Date() , exp : new Date(decoded.exp * 1000)} });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports = { CreateUser,loginUser}

