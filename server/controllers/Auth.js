const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utills/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate")

//Send OTP
exports.sendOTP = async (req,res) => {
    try{
        //fetch data
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered!!",
            });
        }

        // generate otp - phele check krlo ki otp-generator wala package tumne install kr rakha h na
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ",otp);

        //check unique otp or not
        const result = await OTP.findOne({otp:otp});

        //jb tk mujhe unique otp nhi mil rha tb tk m otp generate krta rhunga
        while(result) {
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        // CHATGPT for unique OTP 
        /*
        let otp;
        let isUnique = false;
        let attempts = 0; // To prevent infinite loops
        const maxAttempts = 10; // Limit OTP generation attempts

        // Generate a unique OTP                                               
        while (!isUnique && attempts < maxAttempts) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            // Check if OTP already exists in DB
            const existingOtp = await OTP.findOne({ otp });

            if (!existingOtp) {
                isUnique = true;
            }
            attempts++;
        }

        // If unique OTP not found after multiple attempts, return error
        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate a unique OTP. Please try again.",
            });
        }
        */

        // ab is unique otp ki entry db m save krni h
        const otpPayLoad = {email, otp}; // hmne createdAt ko default set kr rakha h

        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully!!',
            otp,
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
};

//get all users
// exports.users=async(req,res)=>{
//   try{
//  const user=await User.find({});

//   return res.status(200).json({
//     success: true,
//     message: "User already exists. Please sign in to continue.",
//     data:user
//   });
//   }
//   catch(err){
//     console.log("error in user display");
//   }
// }

//SignUp
exports.signUP = async (req,res) => {
    try{
        // data fetch from request ki body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;

        // validate krlo 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp)  {
            return res.status(403).json({
                success:false,
                message:"All fields are required!!",
            });
        }

        // 2 password match krlo
        if(password !== confirmPassword){
            return res.status(403).json({
                success:false,
                message:"Password and Confirm Password does not match!!",
            });
        }

        //check user already exist or not 
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered!!",
            });
        }

        // find most recent OTP stored in db for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1); // return an array // sort the results by createdAt field, here -1 means descending order(newest first), limits the results to only one document
                // OR   
        // const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
        console.log("RecentOTP: ",recentOtp);

        //validate OTP
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(401).json({
                success:false,
                message:"OTP not found!!",
            });
        } else if(otp !== recentOtp[0].otp) {
            // Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid Otp!!",
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password,10);

        // Create the user
        let approved = "";
        if (accountType === "Instructor") {
            approved = false; // Maybe approval needed
        } else {
            approved = true;
        }

        //create entry in db
          // mujhe object id deni thi additionalDetails m isliye ye likha
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumber,
        })
        const user = await User.create({
            firstName,lastName,email,password:hashedPassword,
            accountType,additionalDetails: profileDetails._id, approved,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // send response
        return res.status(200).json({
            success:true,
            message:"User registered Successfully!!",
            user,
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again!!",
        });
    }
}

//Login
exports.login = async (req,res) => {
    try{
        console.log("Request Body:", req.body);
        // get data from req body
        const { email, password } = req.body

        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"Filled all details!!",
            });
        }

        //user check exist or not 
        const user = await User.findOne({email}).populate("additionalDetails"); // it give a full user with additional details

        if(!user){
            return res.status(403).json({
                success:false,
                message:"Plesae signup!!",
            });
        }

        // password matching
        if(await bcrypt.compare(password,user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            //  generate JWT(
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully!!",
            });
        }
        else{
            return res.status(403).json({
                success:false,
                message:"Password is Incorrect!!",
            });
        }
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure, Please try again!!",
        });
    }
};

// ChangePassword -> HOMEWORK
exports.changePassword = async (req,res) => {
    try{
        // get oldPassword, newPassword, confirmPassword from req body
        const {oldPassword , newPassword } = req.body;

        // validation
        if(!oldPassword || !newPassword ){
            return res.status(403).json({
                success:false,
                message:"All fields are required!!",
            });
        }

        // if (newPassword !== confirmPassword) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "New password and confirm password do not match!",
        //     });
        // }

        // const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        // if (!token) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Unauthorized: Token missing",
        //     });
        // }

        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // const user = await User.findById(decoded.id);
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(403).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        // hashed the password
        const hashedPassword= await bcrypt.hash(newPassword,10);
          
        // update password
        user.password = hashedPassword;
        await user.save();

        
        // send mail - Password updated
        // await mailSender(user.email,"Password Updated","Your Password Updated Successfully!!");
        // Send notification email
        try {
        const emailResponse = await mailSender(
            user.email,
            "Password for your account has been updated",
            passwordUpdated(
            user.email,
            `Password updated successfully for ${user.firstName} ${user.lastName}`
            )
        )
        console.log("Email sent successfully:", emailResponse.response)
        } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
        })
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully!",
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failure in Change Password, Please try again!!",
        });
    }
    
}