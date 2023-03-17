const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto")
// const jwt = require('jsonwebtoken')
///schema represent documenet mtlb ju hum database data save krthy hae wu humy kis tara chaiyae hothy us liyae used krthy hae
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true

    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    cpassword: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    image: {
        type: String,
        // require: true
       
    },

    
    
})
//we are hashing a password

userSchema.pre('save', async function (next) {
    // console.log('hi from inside')
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12)
        this.cpassword = await bcrypt.hash(this.cpassword, 12)

    }
    next();
})
// // we are generating a token
// userShema.methods.generateAuthToken = async function() {
//     try {
//         let token = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
//         this.tokens = this.tokens.concat({token: token});
//         await this.ave();
//         return token; 

//     }
//     catch (err) {
//         console.log(err);
//     }
// }
// we are generating a token
userSchema.methods.generateAuthToken = function() {
    try {
        return jwt.sign({ id: this._id}, process.env.SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        // this.tokens = this.tokens.concat({token: token});
        // await this.save();
        // return token; 

    }
    catch (err) {
        console.log(err);
    }
}

/////////reset token password
userSchema.methods.getResetPasswordToken = async function() {

   
    const resettoken = crypto.randomBytes(20).toString("hex")

///////////hashing and resetpasswordtoken to userShema

this.resetPasswordToken = crypto
.createHash("sha256")
.update(resettoken)
.digest("hex")

this.resetPasswordExpire = Date.now() + 15*60*1000;
return resettoken;
}

const User = mongoose.model('register', userSchema )
module.exports= User;