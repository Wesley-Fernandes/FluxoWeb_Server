const router = require('express').Router();
const Item = require('../models/Item')
const jwt = require('jsonwebtoken')

function checkToken(req, res, next){
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({menssage: "Acesso negado!"})
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);

        next();
    } catch (error) {
        return res.status(400).json({menssage: "Token invalido!"})
    }
}

router.post('/', checkToken, async (request, response) => {

    const { name, created, description, unit, condominum, operator, create, until, status } = request.body

    if (!name || !created || !description || !unit || !condominum || !operator) {
        response.status(422).json({ menssage: "Todos os campos precisam ser definidos!" })
        return
    }


    const item = { name, created, description, unit, condominum, operator, create, until, status }

    try {

        await Item.create(item)
        response.status(201).json({menssage:"Item criado com sucesso!"})

    } catch (error) {
        response.status(500).json({menssage:"Houve um erro:".concat(error) })
    }
})

router.get('/', checkToken, async (request, response) => {


    try {

        const items = await Item.find()
        response.status(200).json(items)

    } catch (error) {
        response.status(500).json({menssage:"Houve um erro:".concat(error)})
    }
})

router.get('/:id', checkToken, async (request, response) => {
    const id = request.params.id

    try {
        const item = await Item.findOne({ _id: id })

        if (!item) {
            response.status(422).json({ Error: "O item não existe." })
            return

        } else {
            response.status(200).json(item)
            return
        }
    } catch (error) {
        response.status(500).json({ error: error })
        return
    }
})

router.patch('/:id', checkToken, async (req, res) => {
    const id = req.params.id

    const { name, description, unit, condominum, operator, status } = req.body


    
    if (!name && !description && !unit && !condominum && !operator && !status) {
        res.status(500).json({ Error: "Sem atributos para estabelecer uma atualização." })
        return
    }

    const item = { name, description, unit, condominum, operator, status }
    console.log(item);

    try {

        const updateItem = await Item.updateOne({ _id: id }, item)

        if (updateItem.matchedCount === 0) {
            res.status(422).json({ Erro: "Item não encontrado." })
            return
        }

        res.status(200).json(item)

    } catch (error) {
        res.status(500).json(error)
    }
})

router.delete('/:id', checkToken, async (req, res) => {
    const id = req.params.id

    try {
        const item = await Item.findOne({ _id: id })

        if (!item) {
            res.status(500).json({ Error: `O item não existe` })
            return
        }

        await Item.deleteOne({ _id: id })
        res.status(200).json({ menssage: `Item ${id} deletado com sucesso` })

    } catch (error) {
        res.status(500).json({ erro: error })
    }


})



module.exports = router