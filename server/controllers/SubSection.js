const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
require("dotenv").config();
const {uploadImageToCloudinary} = require("../utills/imageUploader");

// create Subsection
exports.createSubSection = async (req,res) => {
    try{
        // data fetch
           // subsection ko section m hi insert kroge na isliye sectionId chaiye
        const {sectionId,title,description} = req.body;

        //Extract file/video
        const video = req.files.video;
        
        //validation
        if(!sectionId || !title ||!description ||!video){
            return res.status(400).json({
                success:false,
                message:"All fields are required!",
            });
        }
        console.log(video);
        
        // upload video to cloudinary becoz hme secure url chaiye
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        // create a subSection
        const subSectionDetails = await SubSection.create({
            title, timeDuration: `${uploadDetails.duration}`,description,
            videoUrl:uploadDetails.secure_url,
        });

        // push subsection ki objectid in section model
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                {$push:{
                                                    subSection:subSectionDetails._id,
                                                }},
                                                {new:true}
                                                ).populate("subSection");
        // HOMEWORK: Use populate function 

        // return response
        return res.status(200).json({
            success:true,
            message:"SubSection created Successfully!",
            data:updatedSection,
        });
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failed to create SubSection!",
            error:error.message,
        }); 
    }
}

//Update SubSection ka handler
// exports.updateSubSection = async (req,res) => {
//     try{
//         // data fetch
//         const {title, sectionId,description,subSectionId} = req.body
//         const subSection = await SubSection.findById(subSectionId)
//         //Extract file/video
//         const video = req.files.videoFile;

//         // data validation
//         if(!title || !timeDuration ||!description ||!video || !subSectionId) {
//             return res.status(400).json({
//                 success:false,
//                 message:"All fields are required!",
//             });
//         }

//         // upload video to cloudinary becoz hme secure url chaiye
//         const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

//         // update data
//         // mujhe section k andar subsection update krne ki need nhi h becz section k andar subsectionId h na ki data
//         const subSection = await SubSection.findByIdAndUpdate(subSectionId,{ title, timeDuration,description,videoUrl:uploadDetails.secure_url},{new:true});

//         return res.status(200).json({
//             success:true,
//             message:"subSection updated Successfully!",
//             subSection,
//         });
//     } catch(error){
//         console.log(error)
//         return res.status(500).json({
//             success:false,
//             message:"Failed to Update SubSection!",
//             error:error.message,
//         });
//     }
// }

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

// Delete Subsection ka handler
// exports.deleteSubSection = async (req,res) => {
//     try{
//         // data fetch - assuming that we are sending ID in params
//         const {subSectionId} = req.body;

//         // data validation
//         if(!subSectionId) {
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

//         await SubSection.findByIdAndDelete(subSectionId);
        
//         return res.status(200).json({
//             success:true,
//             message:"SubSection deleted Successfully!",
//         });
//     } catch(error){
//         console.log(error)
//         return res.status(500).json({
//             success:false, 
//             message:"Failed to Delete SubSection!",
//             error:error.message,
//         });
//     }
// }

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}