class ApiResponse {
    constructor(statusCode, title="", data, message = "Success",flag=""){
        this.statusCode = statusCode;
        this.title= title;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.flag = flag;
    }
}

export default ApiResponse;