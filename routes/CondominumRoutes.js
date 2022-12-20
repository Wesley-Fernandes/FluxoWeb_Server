const router = require('express').Router();

router.get('/', (req, res)=>{
    const full_condominums = [
        "Alta Vista", "Beverlly Hills", "Chanceler",
        "Dom Domingos"
    ]
    res.status(200).json(full_condominums)
})


module.exports = router