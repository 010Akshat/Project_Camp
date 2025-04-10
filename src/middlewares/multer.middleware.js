// Multer middleware stores files send by user in local diskStorage.
// Storing data in third party library will be handled later .

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images') // null -> Error Handling(multer doesn't handle error)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix) // changing name of file to make it unique
    }
  })
  
export const upload = multer({ 
    storage: storage,
    limits:{
        fileSize: 1*1000*1000
    },
 });