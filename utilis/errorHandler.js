//Handling Errors

class ErrorHandler extends Error{   //Error is a Parent Class and Error Handler is a Child Class
    constructor(message,statusCode) {
        super(message); //Constructor of the parent Class
        this.statusCode = statusCode; //Set the statusCode

        
    }
}
module.exports = ErrorHandler;
