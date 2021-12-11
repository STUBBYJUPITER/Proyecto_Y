const express = require ('express');
const colors =  require ('colors');
const dotenv =  require('dotenv');
const session = require('express-session');
const bcryptjs = require('bcryptjs');

const app=express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//conf dotenv
dotenv.config({path:'./env/.env'});
//use public
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname +'public'));
//plantilla
app.set('view engine', 'ejs');
//variable de session
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}));
//modulo de conexion de DB
const connection = require('./database/db');
const res = require('express/lib/response');
//-------------------todas las rutas------------------------------------

app.get('/login',(req, res)=>{   
    res.render('login');
});
app.get('/register',(req, res)=>{   
    res.render('register');
});




//---------------------------------------------------------------------
//-----------------------codigo para registrar---------------------------
app.post('/register',async(req,res)=>{
    const C_username=req.body.username;
    const C_user=req.body.nombre;
    const C_apellido1=req.body.apellido1;
    const C_apellido2=req.body.apellido2;
    const C_nacimiento = req.body.f_nacimiento;
    const C_correo=req.body.correo;
    const C_rol=req.body.rol;
    const C_pass=req.body.pass;
    const C_pass2=req.body.pass2;
    if(C_pass == C_pass2){
        let passwordHaash = await bcryptjs.hash(C_pass, 8);
        connection.query('INSERT INTO users SET ?',{username:C_username, nombre:C_user,apellido1:C_apellido1,
            apellido2:C_apellido2,  f_nacimiento: C_nacimiento, correo:C_correo,
            rol:C_rol, pass:passwordHaash}, async(error,results)=>{
            if(error){
                console.log(error);
    
            }else{
                res.render('register',{
                    alert:true,
                    alertTitle: "Registro",
                    alertMessage: "¡Registro exitoso!",
                    alertIcon: 'success',
                    showConfirmButton:false,
                    timer:3500,
                    ruta:''
                });
    
            }
        });

    }else{
        res.render('register',{
            alert:true,
            alertTitle: "Error",
            alertMessage: "¡La Contraseña no coincide!",
            alertIcon: 'warning',
            showConfirmButton:true,
            timer:3500,
            ruta:'register'
        });

    }



});
//--------------------------------------------------------------------
//---------------------------autentificacion-------------------------
app.post('/auth', async (req, res)=>{
    const user=req.body.user;
    const pass=req.body.pass;
    let passwordHaash= await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE username = ?', [user], async (error, results, fields)=>{
            if(results.length == 0 || !( await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'    
                });
            
            }else{
                req.session.loggeado=true;
                req.session.nombre = results[0].nombre;
                console.log(req.session.user);
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexion Aprovada",
                    alertMessage: "Inicio de sesion completada",
                    alertIcon:'success',
                    showConfirmButton: false,
                    timer: 2500,
                    ruta: ''    
                });
            }
        });
    }else{
        res.render('login', {
            alert: true,
            alertTitle: "ERROR :c",
            alertMessage: "Ingrese un usuario Y/O Contraseña",
            alertIcon:'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'    
        });
    }

});
//-------------------------------------------------------------------
//--------------------Autentificacion de las paginas-----------------
app.get('/', (req, res)=>{
    if(req.session.loggeado){
        res.render('index',{
            login: true,
            name: req.session.nombre
            
        });
       
    }else{
        res.render('index',{
            login: false,
            name: 'Usuario sin Autenticar'
        });
    }
    console.log(req.session.nombre);
});
//-------------------------------------------------------------------
//----------------log aut--------------------------------------------
app.get('/logout',(req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
});
//-------------------------------------------------------------------
app.listen(3000, (req,resp)=>{

    console.log('server on port 3000'.green);
});
