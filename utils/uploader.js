const cloudinary = require('cloudinary').v2;

exports.uploadToClodinary = async (file,folder,height,quality) => {
    const options={folder};

    if(height){
        options.height=innerHeight;
    }

    if(quality){
        options.quality=quality;
    }

    options.resource_type="auto";

    try{
        return await cloudinary.uploader.upload(file.tempFilePath,options);
    }catch(err){
        console.log("Cloudinary upload error",err);
        console.error("Cloudinary upload error",err.message);
        throw new Error("File upload failed. Please try again later.");
    }
}