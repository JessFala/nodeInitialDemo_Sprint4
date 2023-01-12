const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Users} = require('../models/Users.js');

const register = async (req, res) => {

    const userName = req.body.userName;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    //Check if credentials provided
    if (!userName || !password || !confirmPassword) {
        return res.status(400).json({ 
            status: "error", 
            error: `Input field missing`
        });
    }

    if(password !== confirmPassword) {
        return res.status(400).json({
            status: "error",
            error: "Password and confirmation password don't match"
        })
    }

    try {
        //Check if username is already in use 
        const userFound = await Users.findOne({ userName });
        if(userFound) {
            return res.status(400).json({ 
                status: "error", 
                message: `Username already registered`});

        }
        // Hash user password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //Save user to db with hashed password
        const newUser = await Users.create({ 
            userName: userName, 
            password: hashedPassword 
        })
        //console.log(newUser);

        const payload = {
            userId: newUser._id,
            userName: newUser.userName
        }
        // Creates JWT
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY);
        
        console.log('JWT created ' + accessToken);

        return res.status(201).json({
            status: "ok", 
            payload: payload,
            accessToken: accessToken
            //message: `user ${userName} registered`
        });

     } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}

module.exports = register;