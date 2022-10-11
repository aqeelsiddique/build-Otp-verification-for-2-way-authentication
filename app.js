const express=require('express');
const bodyparser=require('body-parser');
const nodemailer=require('nodemailer');
const path=require('path');
var exphbs = require('express-handlebars');

const app=express();

// view engine setup
app.engine('handlebars',exphbs.engine({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));
app.set('view engine','handlebars');

// app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main", layoutsDir: "views/" }));

// app.set('view engine', '.hbs');
// body parser middleware
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());

//static folder
app.use('/public',express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));


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
      user: 'email',
      pass: 'pass',
    }
    
});
////////////////post method

app.post('/send',function(req,res){
    email=req.body.email;

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

app.post('/verify',function(req,res){

    if(req.body.otp==otp){
        res.send("You has been successfully registered");
    }
    else{
        res.render('otp',{msg : 'otp is incorrect'});
    }
}); 



//defining port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})
