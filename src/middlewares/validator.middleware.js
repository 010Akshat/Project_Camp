import {validationResult} from "express-validator";
import {ApiError} from "../utils/api-error.js"
export const validate = (req,res,next)=>{
    // Error returned by userRegistrationValidator will be accepted in validationResult(req);
    const errors = validationResult(req);
    // If no errors proceed to auth.controller.js
    if(errors.isEmpty()){
        return next();
    }
    // console.log(errors);
    // console.log(errors.array());

    const extractedError= [];
    errors.array().map((err)=>extractedError.push({
        [err.path]:err.msg   // err.path is not fixed string , infact we want value of err.path to be key so for that we use [].
    }))
    console.log(extractedError)

    throw new ApiError(422,"Received data is not valid",extractedError)

}


// console.log(errors)
/*
Result {
  formatter: [Function: formatter],
  errors: [
    {
      type: 'field',
      value: '',
      msg: 'Email is required',
      path: 'email',
      location: 'body'
    },
    {
      type: 'field',
      value: '',
      msg: 'Email is invalid',
      path: 'email',
      location: 'body'
    },
    {
      type: 'field',
      value: '',
      msg: 'Username is required',
      path: 'username',
      location: 'body'
    },
    {
      type: 'field',
      value: '',
      msg: 'username should be atleast 3 char',
      path: 'username',
      location: 'body'
    }
  ]
}


console.log(errors.array())  -> It provides only array.
[
  {
    type: 'field',
    value: '',
    msg: 'Email is required',
    path: 'email',
    location: 'body'
  },
  {
    type: 'field',
    value: '',
    msg: 'Email is invalid',
    path: 'email',
    location: 'body'
  },
  {
    type: 'field',
    value: '',
    msg: 'Username is required',
    path: 'username',
    location: 'body'
  },
  {
    type: 'field',
    value: '',
    msg: 'username should be atleast 3 char',
    path: 'username',
    location: 'body'
  }
]


console.log(extractedErrors) -> We want to send data to frontend in structured format.

[
  { email: 'Email is required' },
  { email: 'Email is invalid' },
  { username: 'Username is required' },
  { username: 'username should be atleast 3 char' }
]
*/