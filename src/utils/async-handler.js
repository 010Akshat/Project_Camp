function asyncHandler(requestHandler){
    return function(req,res,next){
        Promise
            .resolve(requestHandler(req,res,next))
            .catch(function(err){
                next(err)
        })
    }
}

export {asyncHandler}

/*
.catch(error => next(error))
this next(error) a lot of things behind the scene by default

next(error) will call default error handling machenism provided by Express(app.js)

We can provide custom error handling machenism too

Note: It should have all four parameters (err, req, res, next)

app.use((err, req, res, next) => {
    console.error("my custorm error handling");
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Something went wrong',
    });
  });

We can create multiple error handling may be after each middleware in app.js/router files
and nearest error handling will be called if error occur.

In this current code default machenism is provided by express which may look like
app.use((err, req, res, next) => {
  console.error(err.stack); // due to this we see stack of errors
  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});
*/


/*
this code
 (Promise
    .resolve(requestHandler(req, res, next))
    .catch(error => next(error)))

and this code are same
    (new Promise((resolve, reject)=>{
        requestHandler(req, res, next)
        resolve()
    })
    .catch(error => next(error)))
*/