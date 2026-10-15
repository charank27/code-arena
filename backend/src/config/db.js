const mongoose=require("mongoose")
require('dotenv').config()
async function main() {
    if (!process.env.DB_STRING) {
        throw new Error("DB_STRING environment variable is missing");
    }
    await mongoose.connect(process.env.DB_STRING, {
        serverSelectionTimeoutMS: 5000
    });
}
module.exports=main