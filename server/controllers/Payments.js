const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utills/mailSender");
// const mongoose = require("mongoose")
// course Enrollment ki mail send krne k liye
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const { default: mongoose } = require("mongoose");
const CourseProgress = require("../models/CourseProgress")
const crypto = require("crypto");

//capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {

//     //get courseId and UserId
//     const { courseId } = req.body;
//     const userId = req.user.id; // string type

//     //validation
//     if (!courseId) {
//         return res.status(400).json({
//             success: false,
//             message: "Please provide valid course ID!",
//         });
//     }

//     //valid courseDetails
//     let courseDetails;
//     try {
//         courseDetails = await Course.findById(courseId);
//         if (!courseDetails) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Could not find the course!",
//             });
//         }

//         //check user already pay for the same course
//         // hmne course model m studentEnrolled bna rakha h to hm vha s check kr skte h
//         // course model m user ki id object type m store h
//         const uId = mongoose.Types.ObjectId(userId);
//         //includes() checks for strict equality (===).
//         if (courseDetails.studentEnrolled.includes(uId)) {
//             return res.status(200).json({
//                 success: false,
//                 message: "Student is already enrolled!",
//             });
//         }
//         // age mujhe userId ko ObjectId m convert kre bina krna h to 
//         // const alreadyEnrolled = courseDetails.studentsEnrolled.some(
//         //     (enrolledId) => enrolledId.equals(userId)
//         //   );
//         // .equals() handles both ObjectId and string comparisons.

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }

//     // order create -> read documentation
//     const amount = courseDetails.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         // age hme receipt bhi chaiye to
//         receipt: Math.random(Date.now()).toString(),
//         notes: {
//             courseId,
//             userId,
//         }
//     }

//     try {
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options); // order created
//         console.log(paymentResponse);

//         // return response
//         return res.status(200).json({
//             success: true,
//             courseName: courseDetails.courseName,
//             courseDescription: courseDetails.courseDescription,
//             thumbNail: courseDetails.thumbNail,
//             orderId: paymentResponse.id,
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount,
//             message: "Order created Successfully!",
//         });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             success: false,
//             message: "Could not initiate order!",
//         });
//     }

// };

// //abhi payment create hui h na ki authorize

// // verify Signature of Razorpay and Server

// exports.verifySignature = async (req,res) => {
//     // yha mujhe matching krni  SECRET kry ki server and razorpay dono side
//     const webhookSecret = "12345678"; // from server side
//     const signature = req.headers["x-razorpay-signature"]; // from razorpay side
//     // is key x-razorpay-signature k andar ye signature h

//     // convert webhookSecret into encypted for matching
//     // Learn these 3 steps
//     const shasum = crypto.createHmac("sha256",webhookSecret); // hmac object
//     shasum.update(JSON.stringify(req.body)); //convert it into string format
//     const digest = shasum.digest("hex");

//     // matching
//     if(signature === digest) {
//         console.log("Payment is authorized!");
//         // ye verify signature wali request to razorpay s aayi h na ki frontend s
//         // to mujhe userId and courseId notes s milenge isliye mne notes m bheja tha
//         const {courseId,userId} = req.body.payload.payment.entity.notes; 
//         // hme yha in ids ko verify krne ki need nhi h becoz hmne upper verify krke hi send kri thi
//         try{
//             // fulfill tha action
//             // find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate(
//                                         {_id:courseId},
//                                         {$push:{
//                                             studentEnrolled:userId
//                                         }},
//                                         {new:true},
//             );
//             if(!enrolledCourse) {
//                 return res.status(500).json({
//                     success:false,
//                     message:"Course not found!",
//                 });
//             }
//             console.log(enrolledCourse);

//             // find the student and add the course to their enrolled course 
//             const enrolledStudent =  await User.findOneAndUpdate(
//                 {_id:userId},
//                 {$push:{
//                     courses:courseId,
//                 }},
//                 {new:true},
//             );
//             console.log(enrolledStudent);

//             //ab mail send kro enrollment ki
//             const emailResponse = await mailSender(
//                             enrolledStudent.email,
//                             "Course Enrollment Confirmation",
//                             "Congratulations! you are onboarded into new Codehelp Course"
//             );

//             console.log(emailResponse);

//             return res.status(200).json({
//                 success:true,
//                 message:"Signature Verified and Course Added",
//             });
//         } catch(error){
//             console.log(error)
//             return res.status(500).json({
//             success: false,
//             message: error.message,
//             });
//         }
//     }
//     else{
//         // jb signature match nhi hua tb
//         return res.status(500).json({
//             success: false,
//             message: "Signature is not Verified!",
//             });
//     }
// }; 


exports.capturePayment = async (req, res) => {
  const { courses } = req.body // isme 1 se jayada courses bhi ho skte h 
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.status(200).json({
    success: true,
    message: paymentResponse,  
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id || 
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    // enrolled the student 
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) { 
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  } 
}  