class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode;
        this.message=message
        this.success=false
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            // Capture stack trace, omitting the constructor call
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}

/*
Case 1: Using Error.captureStackTrace

Code:
class MyCustomError extends Error {
  constructor(message) {
    super(message);

    // Capture stack trace, omitting the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

try {
  throw new MyCustomError("Something went wrong!");
} catch (err) {
  console.error(err.stack);
}

Output:
MyCustomError: Something went wrong!
    at Object.<anonymous> (path/to/file.js:10:9)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    ...
Observation:

The constructor (MyCustomError) is omitted from the stack trace.
The stack starts from the point where the error was thrown (throw new MyCustomError("Something went wrong!")).

Case 2: Without Error.captureStackTrace
Code:
class MyCustomError extends Error {
  constructor(message) {
    super(message);

    // No captureStackTrace used
  }
}

try {
  throw new MyCustomError("Something went wrong!");
} catch (err) {
  console.error(err.stack);
}
Output:
MyCustomError: Something went wrong!
    at new MyCustomError (path/to/file.js:5:5)
    at Object.<anonymous> (path/to/file.js:10:9)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    ...
Observation:

The constructor (new MyCustomError) appears in the stack trace.
The stack includes an additional function call (MyCustomError constructor), making it slightly longer.
*/


/*
Error.captureStackTrace(this) will run by default by Error class
Error.captureStackTrace(this, this.constructor) only ensures that constructor of APIError is not present in stackTrace

When we throw error Object of ApiError Class propogates to default error handling middleware of Express(app.js)
so we can't change name of variables
Example -> this.status or this.statusCode is only allowed

*/