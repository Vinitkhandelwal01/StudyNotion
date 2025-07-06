const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req,res,next) => {
    try{
        // authentication k liye hm jsontoken ko verify krte h
        // we can extract token by 3 ways(cookie,body,bearer token)
        // const token = req.cookies.token || req.body.token || (req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));
        // console.log("req.headers.authorization:", req.headers.authorization);
        // console.log("req.user:", req.user); // <-- should contain userId

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({
            success: false,
            message: "Token is missing or invalid format",
        });
        }

        const token = authHeader.split(" ")[1]; // Extract the token

        // if token missing, then return response
        if(!token) {
            return res.status(403).json({
                success:false,
                message:"Token is missing",
            });
        }

        // verify the token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET); // returns the decoded payload of the token. // here decode is object
            console.log(decode);

            req.user = decode; // req k andar user object m is decode payload ko dal de
            console.log("req.user (after decode):", req.user);
        } catch(error){
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            });
        }
        next(); // for going to next middleware

    } catch(error) {
        return res.status(401).json({
            success:false,
            message:"Something went wrong"
        });
    }
}

// isStudent middleware -- to mujhe role s pta lgega ki user student h ya nhi
exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType !=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student"
            });
        }
        next();

    } catch(error){
        return res.status(401).json({
            success:false,
            message:"User role is not matching"
        });
    }
}

// isAdmin middleware -- to mujhe role s pta lgega ki user Admin h ya nhi
exports.isAdmin = (req,res,next) => {
    try{
        if(req.user.accountType !=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin"
            });
        }
        next();

    } catch(error){
        return res.status(401).json({
            success:false,
            message:"User role is not matching"
        });
    }
}

// isInstructor
exports.isInstructor = (req,res,next) => {
    try{
        if(req.user.accountType !=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor"
            });
        }
        next();

    } catch(error){
        return res.status(401).json({
            success:false,
            message:"User role is not matching"
        });
    }
}