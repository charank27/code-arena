const validator=require("validator")
const validate=(data)=>{
    const mandField=["firstName","emailId","password"]
    const isAllowed=mandField.every((key)=>Object.keys(data).includes(key))
    if(!isAllowed){
        throw new Error("some Fields are missing")
    }
    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid Email")
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error("weak password")
    }
}
module.exports=validate;