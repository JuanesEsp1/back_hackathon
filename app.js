const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const connection = require("./controller/db.js");
const facturaController = require("./controller/facturaController.js");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


// Servir archivo de prueba
app.get('/cliente', (req, res) => {
    res.sendFile(__dirname + '/cliente.html');
});

app.get('/soporte', (req, res) => {
    res.sendFile(__dirname + '/soporte.html');
});

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

app.get("/usuarios/:id", async (req, res) => {
    const { id } = req.params
    const result = `SELECT * FROM users WHERE id = ${id}`
    connection.query(result, (err, results) => {
        if (err) throw err;
        res.json(results)
    })
})

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

app.patch("/pqr", async (req, res) => {
    const { id, status, support_response, support_id, support_name } = req.body;
    try {
        const query = "UPDATE PQR SET status = ?, support_response = ?, support_id = ?, support_name = ? WHERE id = ?";
        connection.query(query, [status, support_response, support_id, support_name, id], (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});


// ############## ENDPOINTS CHAT SOPORT ##############

// Crear nuevo chat
// Crear o reutilizar chat existente
app.post("/chat", async (req, res) => {
    const { user_id } = req.body;
    try {
        // Verificar si ya existe un chat abierto para este usuario
        const checkQuery = "SELECT * FROM support_chats WHERE user_id = ? AND status = 'open'";
        connection.query(checkQuery, [user_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error en el servidor");
            }

            if (results.length > 0) {
                // Si ya existe un chat abierto, devolverlo
                res.json(results[0]);
            } else {
                // Si no existe, crear un nuevo chat
                const insertQuery = "INSERT INTO support_chats (user_id, support_id, status) VALUES (?, NULL, 'open')";
                connection.query(insertQuery, [user_id], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error en el servidor");
                    }
                    // Devolver el nuevo chat creado
                    res.json({
                        id: result.insertId,
                        user_id: user_id,
                        support_id: null,
                        status: 'open',
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});


// Asignar agente de soporte al chat
app.patch("/chat/:id/assign", async (req, res) => {
    const { id } = req.params;
    const { support_id } = req.body;
    try {
        const query = "UPDATE support_chats SET support_id = ? WHERE id = ?";
        connection.query(query, [support_id, id], (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Enviar mensaje
app.post("/chat/:chat_id/messages", async (req, res) => {
    const { chat_id } = req.params;
    const { sender_id, message } = req.body;
    try {
        const query = "INSERT INTO chat_messages (chat_id, sender_id, message) VALUES (?, ?, ?)";
        connection.query(query, [chat_id, sender_id, message], (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener mensajes de un chat específico
app.get("/chat/:chat_id/messages", async (req, res) => {
    const { chat_id } = req.params;
    try {
        const query = `
            SELECT cm.message, cm.created_at, cm.sender_id, u.name as sender_name
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.id
            WHERE chat_id = ?
            ORDER BY cm.created_at ASC
        `;
        connection.query(query, [chat_id], (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener chat activo de un usuario
app.get("/chat/user/:user_id/active", async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = `
            SELECT * FROM support_chats 
            WHERE user_id = ? AND status = 'open' 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        connection.query(query, [user_id], (err, results) => {
            if (err) throw err;
            res.json(results[0] || null);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener chats activos de un agente
app.get("/chat/support/:support_id", async (req, res) => {
    const { support_id } = req.params;
    try {
        const query = `
            SELECT sc.*, u.name as user_name
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            WHERE sc.support_id = ? AND sc.status = 'open'
        `;
        connection.query(query, [support_id], (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Cerrar chat
app.patch("/chat/close/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const query = "UPDATE support_chats SET status = 'closed' WHERE id = ?";
        connection.query(query, [id], (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});


// Obtener todos los chats (para el panel de soporte)
app.get("/chats", async (req, res) => {
    try {
        const query = `
            SELECT 
                sc.*,
                u.name as user_name,
                (SELECT message 
                 FROM chat_messages 
                 WHERE chat_id = sc.id 
                 ORDER BY created_at DESC 
                 LIMIT 1) as last_message
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            WHERE sc.status = 'open'
            ORDER BY sc.created_at DESC
        `;
        connection.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// 1. Marcar chat como leído
app.patch("/chat/:chatId/read", async (req, res) => {
    const { chatId } = req.params;
    const { support_id } = req.body;
    try {
        const query = `
            UPDATE support_chats 
            SET last_read = NOW() 
            WHERE id = ? AND support_id = ?
        `;
        connection.query(query, [chatId, support_id], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error al marcar chat como leído:", error);
        res.status(500).json({ message: "Error al actualizar el estado de lectura" });
    }
});

// 2. Obtener mensajes no leídos
app.get("/chat/:chatId/unread", async (req, res) => {
    const { chatId } = req.params;
    try {
        const query = `
            SELECT COUNT(*) as unread_count
            FROM chat_messages
            WHERE chat_id = ? 
            AND created_at > (
                SELECT COALESCE(last_read, created_at)
                FROM support_chats
                WHERE id = ?
            )
        `;
        connection.query(query, [chatId, chatId], (err, results) => {
            if (err) throw err;
            res.json({ unreadCount: results[0].unread_count });
        });
    } catch (error) {
        console.error("Error al obtener mensajes no leídos:", error);
        res.status(500).json({ message: "Error al obtener mensajes no leídos" });
    }
});

// 3. Obtener último mensaje de cada chat
app.get("/chats/last-messages", async (req, res) => {
    try {
        const query = `
            SELECT 
                sc.id as chat_id,
                cm.message,
                cm.created_at,
                u.name as sender_name
            FROM support_chats sc
            LEFT JOIN (
                SELECT chat_id, message, created_at, sender_id
                FROM chat_messages cm1
                WHERE created_at = (
                    SELECT MAX(created_at)
                    FROM chat_messages cm2
                    WHERE cm2.chat_id = cm1.chat_id
                )
            ) cm ON sc.id = cm.chat_id
            LEFT JOIN users u ON cm.sender_id = u.id
            WHERE sc.status = 'open'
        `;
        connection.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error al obtener últimos mensajes:", error);
        res.status(500).json({ message: "Error al obtener últimos mensajes" });
    }
});

// 4. Obtener chats por prioridad
app.get("/chats/priority/:priority", async (req, res) => {
    const { priority } = req.params;
    try {
        const query = `
            SELECT 
                sc.*,
                u.name as user_name,
                su.name as support_name,
                (
                    SELECT COUNT(*)
                    FROM chat_messages
                    WHERE chat_id = sc.id
                ) as message_count
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            LEFT JOIN users su ON sc.support_id = su.id
            WHERE sc.priority = ? AND sc.status = 'open'
            ORDER BY sc.created_at DESC
        `;
        connection.query(query, [priority], (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error al obtener chats por prioridad:", error);
        res.status(500).json({ message: "Error al obtener chats" });
    }
});

// 5. Actualizar el estado de actividad del chat
app.patch("/chat/:chatId/activity", async (req, res) => {
    const { chatId } = req.params;
    try {
        const query = `
            UPDATE support_chats 
            SET last_activity = NOW() 
            WHERE id = ?
        `;
        connection.query(query, [chatId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    } catch (error) {
        console.error("Error al actualizar actividad:", error);
        res.status(500).json({ message: "Error al actualizar actividad" });
    }
});

// 6. Mejorar el endpoint de asignación de agente
app.patch("/chat/:id/assign", async (req, res) => {
    const { id } = req.params;
    const { support_id, support_name } = req.body;
    try {
        const query = `
            UPDATE support_chats 
            SET 
                support_id = ?,
                assigned_at = NOW(),
                last_activity = NOW()
            WHERE id = ? AND (support_id IS NULL OR support_id != ?)
        `;
        connection.query(query, [support_id, id, support_id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows === 0) {
                return res.status(400).json({ 
                    message: "Chat ya está asignado a otro agente" 
                });
            }
            res.json({ 
                success: true, 
                support_id, 
                support_name 
            });
        });
    } catch (error) {
        console.error("Error al asignar agente:", error);
        res.status(500).json({ message: "Error al asignar agente" });
    }
});

// Obtener chats sin asignar
app.get("/chats/unassigned", async (req, res) => {
    try {
        const query = `
            SELECT 
                sc.*,
                u.name as user_name
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            WHERE sc.support_id IS NULL AND sc.status = 'open'
        `;
        connection.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener un chat específico con sus detalles
app.get("/chat/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                sc.*,
                u.name as user_name,
                su.name as support_name
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            LEFT JOIN users su ON sc.support_id = su.id
            WHERE sc.id = ?
        `;
        connection.query(query, [id], (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener chats por estado
app.get("/chats/status/:status", async (req, res) => {
    const { status } = req.params;
    try {
        const query = `
            SELECT 
                sc.*,
                u.name as user_name,
                su.name as support_name
            FROM support_chats sc
            JOIN users u ON sc.user_id = u.id
            LEFT JOIN users su ON sc.support_id = su.id
            WHERE sc.status = ?
        `;
        connection.query(query, [status], (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Transferir chat a otro agente de soporte
app.patch("/chat/:id/transfer", async (req, res) => {
    const { id } = req.params;
    const { new_support_id } = req.body;
    try {
        const query = "UPDATE support_chats SET support_id = ? WHERE id = ?";
        connection.query(query, [new_support_id, id], (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } catch (error) {
        console.error("Error ejecutando la consulta", error.stack);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener estadísticas de chats por agente
app.get("/support/:support_id/stats", async (req, res) => {
    const { support_id } = req.params;
    try {
        const query = `
            SELECT 
                COUNT(CASE WHEN status = 'open' THEN 1 END) as active_chats,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_chats,
                (SELECT COUNT(*) 
                 FROM chat_messages cm
                 JOIN support_chats sc ON cm.chat_id = sc.id
                 WHERE sc.support_id = ?) as total_messages
            FROM support_chats
            WHERE support_id = ?
        `;
        connection.query(query, [support_id, support_id], (err, results) => {
            if (err) throw err;
            res.json(results[0]);
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