const colors = require('colors');
const mysql = require('mysql');
const connection=mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
connection.connect((error)=>{
    if(error){
        console.log('error de conexion :'.red + error);
        return;
    }else{
        console.log('conexion exitosa'.blue);
    }
});
module.exports= connection;