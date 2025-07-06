const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
    try {
        // get userId
        const userId = req.user.id;

        // fetch data from req ki body - Rating,Review and kisi course ko diya h
        const { rating, review, courseId } = req.body;

        // check kro jo user ratingAndreview de rha h vo course m Enrolled h ya nhi 
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentEnrolled: { $elemMatch: { $eq: userId } }, // m check kr rha hu ki ye user is course m enrolled h ya nhi
                // $elemMatch is used to check whether at least one element in the array matches a condition.
            });
        // OR
        // const courseDetails = await Course.findOne({
        //     _id: courseId,
        //     studentEnrolled: userId,
        // });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course",
            });
        }

        // ek user ek baar hi review de skta h 
        // check kro ratingAndReview wale model m ki ye wali courseId and userId exist krti h ya nhi
        const alreadyreviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyreviewed) {
            return res.status(404).json({
                success: false,
                message: `Course is already reviewed by ${userId}`,
            });
        }

        //create Rating and Review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true });
        console.log(updatedCourseDetails);
        
        // return response 
        return res.status(200).json({
            success: true,
            message: "Rating And Review created Successfully",
            ratingReview,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to create Rating and Review!",
            error: error.message,
        });
    }
}

// getAverageRating handler
exports.getAverageRating = async(req,res) => {
    try{
        // get course Id
        const courseId = req.body.courseId;
    
        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{ // ese entry findout krke do jisme course ki field k andar ye courseId ho
                    course: mongoose.Types.ObjectId(courseId), // here we convert the courseId into ObjectId
                }
            },
            { // mtlb mne sari courseId ko group kr liya
                $group:{
                    _id:null, // mtlb jitni bhi entry mere pass aayi thi unko m ek group m wrap kr diay
                    averageRating:{$avg:"$rating"}, // rating k basis pr avg find kr rhe h
                }
            }
        ]);
        // check rating mili ya nhi
        if(result.length>0){
            return res.status(200).json({
                success: true,
                averageRating:result[0].averageRating,
            });
        }

        // agr kisi n rate hi nhi kiya course m
        return res.status(200).json({
            success: true,
            message:"Average Rating is 0,No rating given till now!",
            averageRating:0,
        });
 
        // return rating

    } catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to find average Rating!",
            error: error.message,
        });
    }
}

// getAllRatingAndReview handler -> mtlb jb review likhe aate h tab view all bhi aata h to vo h
exports.getAllRatingAndReview = async (req,res) => {
    try{
        const allReviews = await RatingAndReview.find({}) // sara data le aao
                                .sort({rating:"desc"}) // mtlb desc order m ratingAndReview aani chaiye
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image" // mtlb course m s bs ye field hi lakr dena , jo hm true wala krte the vo hi h bs method alag h

                                })
                                .populate({
                                    path:"course",
                                    select:"courseName" // mtlb course m s bs ye field hi lakr dena , jo hm true wala krte the vo hi h bs method alag h
                                    
                                })
                                .exec();
        
        return res.status(200).json({
            success:true,
            message:"All rating and Review fetch successfully!",
            data:  allReviews,
        })
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to find All Rating!",
            error: error.message,
        });
    }
}