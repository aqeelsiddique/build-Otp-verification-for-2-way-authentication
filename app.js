const express=require('express');
const bodyparser=require('body-parser');
const nodemailer=require('nodemailer');
var fs = require("fs");

const path=require('path');
var exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const register = require("./model/user")
const multer = require("multer");


const app=express();

// view engine setup
app.engine('handlebars',exphbs.engine({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));
app.set('view engine','handlebars');

// app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main", layoutsDir: "views/" }));

// app.set('view engine', '.hbs');
// body parser middleware
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());


////database connection////
const db = process.env.MONGODB_URI || 'mongodb+srv://Aqeel:aqeel12345@cluster0.uhg7y9z.mongodb.net/visiosparkwebsite?retryWrites=true&w=majority';

// Connect to MongoDB instance
mongoose
  .connect(db, {
   useNewUrlParser: true, 
   useUnifiedTopology: true 
  })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.log('MongoDB connection error: ' + err));
//static folder



app.use('/public',express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));



// SET STORAGE
let storage = multer.diskStorage({
    destination: "./public/images", //directory (folder) setting
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname); // file name setting
    },
  });
  var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/png" ||
        file.mimetype == "image/gif"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        cb(new Error("Only jpeg,  jpg , png, and gif Image allow"));
      }
    },
  });


app.get('/',function(req,res){
    res.render('contact');
});
// app.get('/',function(req,res){
//     res.render('contact');
// });

////////////////this code otp genetrate 
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

//////////////////////////nodemailer method used transpoter
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    auth: {
      user: 'webdeveloperaqeel@gmail.com',
      pass: 'uxhcuiszeebphvvl',
    }
    
});
////////////////post method

app.post('/send',upload.single("profile"), function(req,res){
    console.log(req.file);

    name =req.body.name,
    lastname =req.body.lastname,

    
    email =req.body.email,
    password = req.body.password,
    cpassword = req.body.cpassword,
    phone = req.body.phone


     // send mail with defined transport object
    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
        res.render('otp');
    });
});

////after otp received then resend again ethod
app.post('/resend',function(req,res){
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('otp',{msg:"otp has been sent"});
    });

});

//////////verify code 

app.post('/verify',upload.single("profile"),function(req,res){

    

    if (req.body.otp == otp) {
        // Create a new Registration object and save it to the database
        const registration = new register({

            name,
            lastname,

            
            email,
            password,
            cpassword,
            phone,
            profileImage: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png' // Change the content type to match your image format
              }

           

            // Add any other fields that you want to store
        });
        registration.save()
            .then(() => {
                // Send a success message to the user
                res.send('You have been successfully registered!');
            })
            .catch((err) => {
                // Render the OTP verification form with an error message
                res.render('otp', { msg: 'Error saving registration data to database' });
            });

            console.log(registration)

    } else {
        // Render the OTP verification form with an error message
        res.render('otp', { msg: 'OTP is incorrect' });
    }

    // if(req.body.otp==otp){

    //     res.send("You has been successfully registered");
    // }
    // else{
    //     res.render('otp',{msg : 'otp is incorrect'});
    // }
}); 

//defining port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})
