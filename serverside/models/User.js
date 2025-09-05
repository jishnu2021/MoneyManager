import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique:true,
        lowercase:true,
        trim:true,
        validate:[isEmail,'Please enter a valid email']
    },
    password :{
        type:String,
        required: function() {
            return !this.googleId;
        },
        minlength:[6,'Minimum password length is 6 characters']
    },
    googleId: {
        type: String,
        default: null
    },
    PhoneNum:{
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v); 
            },
            message: "Please enter a valid phone number"
        }
    },
    profileImage:{
        type:String,
        default:null
    },
    refreshToken:{
        type:String,
        default:null
    },
    budget:{
        type:Number,
        default:0,
        required:false
    }
},{
    timestamps:true
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    if (this.password === 'oauth-user') return next();
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

export default mongoose.model('usermembers', userSchema)