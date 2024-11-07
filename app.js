const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const connection = require("./controller/db.js");
const facturaController = require("./controller/facturaController.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// ############## ENDPOINTS USUARIOS ##############
app.get("/usuarios", async (req, res) => {
  try {
    const result = "SELECT * FROM users";
    connection.query(result, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (err) {
    console.error("Error ejecutando la consulta", err.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.post("/usuarios", async (req, res) => {
  const { name, email, contact, address, rol, password } = req.body;
  try {
    const query = "INSERT INTO users (name, email, contact, address, rol, password) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(query, [name, email, contact, address, rol, password], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, contact, address, rol, password } = req.body;
  try {
    const query = "UPDATE users SET name = ?, email = ?, contact = ?, address = ?, rol = ?, password = ? WHERE id = ?";
    connection.query(query, [name, email, contact, address, rol, password, id], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM users WHERE id = ?";
    connection.query(query, [id], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

// ############## ENDPOINTS PQR ##############

app.get("/pqr", async (req, res) => {
  try {
    const result = "SELECT * FROM PQR";
    connection.query(result, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.post("/pqr", async (req, res) => {
  const { user_id, support_id, type, description, support_document, support_response, status } = req.body;
  try {
    const query = "INSERT INTO PQR (user_id, support_id, type, description, support_document, support_response, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(query, [user_id, support_id, type, description, support_document, support_response, status], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.patch("/pqr/:id", async (req, res) => {
  const { id } = req.params;
  const { status, support_response, support_id } = req.body;
  try {
    const query = "UPDATE PQR SET status = ?, support_response = ?, support_id = ? WHERE id = ?";
    connection.query(query, [status, support_response, support_id, id], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.error("Error ejecutando la consulta", error.stack);
    res.status(500).send("Error en el servidor");
  }
});

app.post("/factura", facturaController.generarFactura);

app.listen(port, () => {
  console.log("esta corriendo en el puerto: ", port);
});
