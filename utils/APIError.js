class APIError extends Error{
    constructor(
        statusCode,
        title="",
        message="Something Went Wrong",
        error = [],
        name=""
    ){
        super()
        this.statusCode = statusCode;
        this.title=title;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = error;
        this.name = name;
        // if (stack) {
        //     this.stack = stack
        // } else{
        //     Error.captureStackTrace(this, this.constructor)
        // }
    }
}

export default APIError;