import APIError from "./APIError.js";

const ServerError = (res,error,title="") => {
  console.log("error--->",error)
    if (error?.name === "ValidationError") {
        let errors = {};      
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });      
        res.status(500).json(new APIError(500,title,"Something Went Wrong.",errors)) 
    }else if ((error?.name === "MongoServerError" && error?.code === 11000) || error?.name == 'ReferenceError') {
        let errors = {};      
        Object.keys(error?.keyValue).forEach((key) => {
        //   errors[key] = error.keyValue[key];
          errors[key] = `${error.keyValue[key]} Already exists.`;
        }); 
        //Rollback Data Start
        res.status(500).json(new APIError(500,title,"Something Went Wrong.",errors)) 
    }else if ((error?.name === "pre")) {     
      //Rollback Data Start
      res.status(500).json(error) 
  }else{
        //Rollback Data End
        res.status(500).json(new APIError(500,title,"Something Went Wrong.",[]))   
    }   
}

export default ServerError;