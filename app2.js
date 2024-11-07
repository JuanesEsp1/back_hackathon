// const express = require('express');
// const pool = require('./config/db');
// const app = express();
// const cors = require('cors');
// const port = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Ruta básica para la página de inicio
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde Express!');
});

// Ruta para verificar la conexión con la base de datos
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios'); // Consulta SQL
    res.json(result.rows);
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/juanes', async (req, res) => {
  
  
  try {
    const result = await pool.query('SELECT * FROM productos'); // Consulta SQL
    res.json(result.rows);
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).send('Error en el servidor');
  }
  
});

//metodo get para obtener todos los productos 
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos'); // Consulta SQL
    res.json(result.rows);
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).send('Error en el servidor');
  }
});

//metodo post para crear un producto   
app.post('/productos', async (req, res) => {
  const { nombre, descripcion, precio, cantidad } = req.body;
  try {
    const query = 'INSERT INTO productos (nombre, descripcion, precio, cantidad) VALUES ($1, $2, $3, $4 )';
    await pool.query(query, [nombre, descripcion, precio, cantidad ]);
    res.status(201).json({ message: 'Producto creado correctamente' });
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}); 



app.post('/venta', async (req, res) => {
  const { fecha_venta, detalle_venta, empleado, email_cliente, total } = req.body;
  try {
    const query = 'INSERT INTO ventas (fecha_venta, detalle_venta, empleado, email_cliente, total) VALUES ($1, $2, $3, $4, $5)';
    await pool.query(query, [fecha_venta, detalle_venta,empleado, email_cliente, total]);
    res.status(201).json({ message: 'Venta creada correctamente' });
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/ventas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ventas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});



//metodo delete para eliminar un producto 
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}); 

//metodo put para actualizar un producto 
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, cantidad } = req.body;
  try {
    await pool.query('UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, cantidad = $4 WHERE id = $5', [nombre, descripcion, precio, cantidad, id]);
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}); 


// Método POST para verificar el usuario 
app.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  console.log(correo, password);
  if (!correo || !password) {
    return res.status(400).json({ message: 'Se requiere correo y contraseña' });
  }

  try {
    // Consulta para verificar si existe el usuario con ese email y contraseña
    const query = 'SELECT * FROM usuarios WHERE correo = $1 AND password = $2';
    const result = await pool.query(query, [correo, password]);

    if (result.rows.length > 0) {
      res.json({ message: 'Usuario autenticado correctamente', user: result.rows[0] });
    } else {
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});