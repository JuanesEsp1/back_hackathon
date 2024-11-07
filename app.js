const express = require('express')
const app = express()
const cors = require('cors')
const port = 3001
const connection = require('./controller/db.js')


app.get('/usuarios', async (req, res) => {
    try {
      const result ='SELECT * FROM users'
      connection.query(result, (err, results) => {
        if (err) throw err;
        res.json(results);
      });
    } catch (err) {
      console.error('Error ejecutando la consulta', err.stack);
      res.status(500).send('Error en el servidor');
    }
});




app.listen(port,()=>{
    console.log('esta corriendo en el puerto: ',port)
})

