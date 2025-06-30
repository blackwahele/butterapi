import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, 
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET 
});

export const uploadOnCloudinary = async (localFilePath,type) => {
    try {
        let response = null;
        if (!localFilePath) return null
        //upload the file on cloudinary
        if(type == 'single'){
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder:'users/avatar'
            })
        }else if(type == 'multiple'){
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder:'users/otherImg'
            })
        }else{
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
        }
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        // fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("cloudnaryErrrrrr",error)
        // fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export const deleteOnCloudinary = (path,type) => {
    try {
        if(type == 'single'){
            cloudinary.api.delete_resources(`users/avatar/${path}`, { resource_type: 'image'})
        }else if(type == 'multiple'){
            cloudinary.api.delete_resources(`users/otherImg/${path}`, { resource_type: 'image' })
        }else{
            cloudinary.api.delete_resources(path,{ resource_type: 'image' });
        }
    } catch (error) {
        console.log("deleteOnCloudinaryErrr",error)
        return null;        
    }
}
