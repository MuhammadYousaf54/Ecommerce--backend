const app  = require('./app.js');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary')
const connectDatabase = require('./config/dataBase.js');

 dotenv.config({
   path: "backend/config/config.env"
 });
// connect database
connectDatabase();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET

})
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});