const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
exports.createCategory = async (req,res) => {
    try {
        // data fetch from req ki body
        const {name,description} = req.body;

        // validation 
        if(!name ) {
            return res.status(500).json({
                success:false,
                message:"All fields are required!",
            }) 
        }

        // create entry in db
        const categoryDetails = await Category.create({name,description});
        console.log(categoryDetails);

        return res.status(200).json({
            success:true,
            message:"Category created Successfully!!",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// getAllCategories handler function

exports.showAllCategories = async (req,res) => {
    try{
        // m yha fetch kr rha hu but m yha name and description must be present
        const allCategory = await Category.find({});

        return res.status(200).json({
            success:true,
            data:allCategory,
            message:"All Categories return Successfully!!",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//category page details handler function
exports.categoryPageDetails = async(req,res) => {
    try{
        // get category Id
        const {categoryId} = req.body;

        // fetch all the course of this categoryId 
        const selectedCategory = await Category.findById(categoryId)
                                        .populate({
                                            path: "courses",
                                            match: { status: "Published" },
                                            populate: "ratingAndReviews",
                                        })
                                        .exec();
        console.log("Selected Course",selectedCategory)

        // validation - ho skta h ki is category k corresponding koi courese hi na mile
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found!",
            });
        }
        
        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
        })
        } 
        // get courses for different category
        const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
        // get top selling courses 
        //TODO : krna h
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
        .populate({
            path: "courses",
            match: { status: "Published" },
            populate:{
                path:"instructor"
            }
        })
        .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

        // return response
        return res.status(200).json({
            success:true,
            message:"All Categories Page details fetch Successfully!!",
            data:{
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            }
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

