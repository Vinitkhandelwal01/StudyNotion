const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/Subsection");

exports.createSection = async (req,res) => {
    try{
        // data fetch
        const {sectionName,courseId} = req.body;

        // data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:"All fields are required!",
            });
        }

        // create section
        const newSection = await Section.create({sectionName});

        // update course with section objectId
        const updateCourseDetails = await Course.findByIdAndUpdate(courseId,{
                                                    $push:{
                                                        courseContent:newSection._id, // newSection ki objectId
                                                    }
                                                },
                                                {new:true}
        )
        .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // const updatedCourseDetails = await Course.findById(courseId)
    // .populate({
    //     path: "courseContent",
    //     populate: {
    //         path: "subSection"
    //     }
    // });

    // This will:
    // First populate courseContent with the Section documents.
    // Then for each Section, populate its subSection array with actual SubSection documents.


        // return response
        return res.status(200).json({
            success:true,
            message:"Section created Successfully!",
            data:updateCourseDetails,
        });
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failed to create Section!",
            error:error.message,
        });
    }
}

//Update Section ka handler
exports.updateSection = async (req,res) => {
    try{
        // data fetch
        const {sectionName,sectionId,courseId} = req.body;

        // data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:"All fields are required!",
            });
        }

        // update data
        // mujhe course k andar section update krne ki need nhi h becz course k andar sectionId h na ki data
        const section = await Section.findByIdAndUpdate(sectionId,{ sectionName},{new:true});

        const course = await Course.findById(courseId)
          .populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec()
        console.log(course)
        return res.status(200).json({
            success:true,
            message:section,
            data:course,
        });
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failed to Update Section!",
            error:error.message,
        });
    }
}

// Delete section ka handler
// exports.deleteSection = async (req,res) => {
//     try{
//         // data fetch - assuming that we are sending ID in params
//          const { sectionId, courseId } = req.body
//         await Course.findByIdAndUpdate(courseId, {
//         $pull: {
//             courseContent: sectionId,
//         },
//         })
 
//         // data validation
//         if(!sectionId) {
//             return res.status(400).json({
//                 success:false,
//                 message:"All fields are required!",
//             });
//         }

//         // delete data
//         //TODO : do we need to delete the entry from the course schema

//         //  // Find the section to get the course it's associated with
//         //  const section = await Section.findById(sectionId);

//         //  if (!section) {
//         //      return res.status(404).json({
//         //          success: false,
//         //          message: "Section not found!",
//         //      });
//         //  }
 
//         //  // Remove reference from Course.courseContent
//         //  await Course.updateMany(
//         //      { courseContent: sectionId },
//         //      { $pull: { courseContent: sectionId } }
//         //  );

//         await Section.findByIdAndDelete(sectionId);
        
//         return res.status(200).json({
//             success:true,
//             message:"Section deleted Successfully!",
//         });
//     } catch(error){
//         console.log(error)
//         return res.status(500).json({
//             success:false,
//             message:"Failed to delete Section!",
//             error:error.message,
//         });
//     }
// }

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })
    const section = await Section.findById(sectionId)
    console.log(sectionId, courseId)
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })

    await Section.findByIdAndDelete(sectionId)

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section deleted Successfully",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
