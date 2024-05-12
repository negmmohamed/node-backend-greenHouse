
// const multer = require('multer');
// const path = require('path');


// const storage = multer.diskStorage({
//   destination: path.join(__dirname, '../target_images'),
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../target-images'));
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// The idea is that the middleware will be something called like 'upload',
// and it will contain the multer object with ({ storage: object containing all the info related to the storage })
const upload = multer({ storage: storage }).single('image');

module.exports = upload;