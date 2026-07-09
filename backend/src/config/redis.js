const { createClient }= require('redis');
require("dotenv").config()
const redisClient = createClient({
    username: 'default',
    password: process.env.REDISPASS,
    socket: {
        host: 'shade-ultrasmooth-maroon-43119.db.redis.io',
        port: 18771
    }
});
module.exports=redisClient;