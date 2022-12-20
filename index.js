const { response, application } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()




const DB_USER = process.env.DB_USER;
const DB_PASS = encodeURIComponent(process.env.DB_PASS);
const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@apicluster.v4ol36d.mongodb.net/?retryWrites=true&w=majority`






app.use(express.urlencoded({extended: true}))
app.use(express.json())
const corsOptions = {
        origin:'http://localhost:5173',
        optionSuccessStatus:200
    }
app.use(cors())

const User = require('./models/user')
app.post('/auth', (req, res, next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token || token===null){
        return res.status(401).json({token: false})
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        return res.status(200).json({token: true})
    } catch (error) {
        return res.status(400).json({token: false})
    }
})
app.post('/auth/register', async(req, res)=>{

    const {name, email, password, confirmPassword} = req.body;
    
    if(!name || !email || !password || !confirmPassword){
        return res.status(422).json({message: 'Complete todos os parametros'})
    }

    const userExists = await User.findOne({email: email})

    if(userExists){
        return res.status(422).json({error: 'Já existe um usúario com este e-mail!'})
    }

    const salt = await bcrypt.genSalt(12); //adicionar mais letras
    const password_hash = await bcrypt.hash(password, salt);


    const user = new User({
        name,
        email,
        password: password_hash
    })

    try {
        await user.save()
        return res.status(200).json({menssage: "Conta registrada com sucesso!"})
    } catch (error) {
        return res.status(422).json({menssage: error})
    }
})

app.post('/auth/login', async(req, res)=>{
    const {email, password} = req.body

    if(!email || !password){
        return res.status(422).json({menssage:"Complete todos os campos!"})
    }

    const user = await User.findOne({email: email})

    if(!user){
        return res.status(404).json({menssage:"Não existe um usuario com esse email!"})
    }


    const checkpassword = await bcrypt.compare(password, user.password)

    if(!checkpassword){
        return res.status(422).json({menssage: "Senha invalida!"})
    }
    
    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user._id
        }, secret);

        const userData = {
            name: user.name,
            token: token
        }

        res.status(200).json({sucess: "Autentificação realizada com exito!", userData})
    } catch (error) {
        return res.status(404).json({menssage: error})
    }
})

//Rotas da API
const ItemRoutes = require('./routes/ItemRoutes')
app.use('/item', ItemRoutes)





const CondominumRoutes = require('./routes/CondominumRoutes')
app.use('/condominum', CondominumRoutes)





app.get("/", (requests, response)=>{
    response.json({message: "Rota esta funcionando com express!"})
})






mongoose.connect(DB_URL)
    .then((response)=>{
        console.log("Conexão ao MongoDB foi estabelecida com sucesso!");
        app.listen(3020, () => {
            console.log('Aplicação está ouvindo na rota 3020!');
        });
    }).catch((erro)=>{
        console.log(`Houve um erro ao se conectar com MongoDB: ${erro}`);
    })
