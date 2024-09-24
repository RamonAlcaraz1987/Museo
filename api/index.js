const express = require("express");
const translate  = require("node-google-translate-skidz");
 
const app = express();


app.use(express.static("public"));
app.use(express.json());


app.post("/traducir", (req, res) => {
    
    const { titulo, cultura, dinastia } = req.body;
    const textos = [titulo, cultura, dinastia].filter(texto => texto.trim() !== '');
    

    Promise.all(textos.map(texto => 
        new Promise((resolve, reject) => {
            translate({
                text: texto,
                source: 'en',
                target: 'es'
            }, (result) => {
                
                resolve(result.translation);
            });
        })
    ))
    .then(traducciones => {
        res.json({
            titulosTraducidos: traducciones
        });
    })
    
});




module.exports = app;