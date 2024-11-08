CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE PQR (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT ,
    support_id INT ,
    support_name VARCHAR(255) ,
    type VARCHAR(255) ,
    description TEXT,
    support_document VARCHAR(255),
    support_response VARCHAR(255),
    status VARCHAR(255) 
);

-- Tabla de tickets de soporte
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    support_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de chats
CREATE TABLE support_chats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    support_id INT,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES support_chats(id)
);

-- Actualizar la tabla de support_chats
ALTER TABLE support_chats
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE support_chats
ADD COLUMN last_read TIMESTAMP NULL,
ADD COLUMN last_activity TIMESTAMP NULL,
ADD COLUMN assigned_at TIMESTAMP NULL,
ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium';

CREATE INDEX idx_support_chats_status ON support_chats(status);
CREATE INDEX idx_support_chats_priority ON support_chats(priority);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_support_chats_support_id ON support_chats(support_id);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);




-- FUNCIONAMIENTO BASICO DEL CHAT CON SQL

-- 1. Crear un nuevo chat cuando un usuario inicia una conversación
INSERT INTO support_chats (user_id, support_id, status) 
VALUES (1, NULL, 'open');

-- 2. Asignar un agente de soporte al chat
UPDATE support_chats 
SET support_id = 2 
WHERE id = 1;

-- 3. Insertar mensajes en el chat
-- Mensaje del usuario
INSERT INTO chat_messages (chat_id, sender_id, message) 
VALUES (1, 1, '¡Hola! Necesito ayuda con mi pedido');

-- Respuesta del agente de soporte
INSERT INTO chat_messages (chat_id, sender_id, message) 
VALUES (1, 2, 'Hola, ¿en qué puedo ayudarte?');

-- 4. Obtener todos los mensajes de un chat específico
SELECT 
    cm.message,
    cm.created_at,
    cm.sender_id,
    u.name as sender_name
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
WHERE chat_id = 1
ORDER BY cm.created_at ASC;

-- 5. Obtener los chats activos de un agente de soporte
SELECT 
    sc.*,
    u.name as user_name
FROM support_chats sc
JOIN users u ON sc.user_id = u.id
WHERE sc.support_id = 2 
AND sc.status = 'open';

-- 6. Cerrar un chat
UPDATE support_chats 
SET status = 'closed' 
WHERE id = 1;

-- 7. Obtener el último mensaje de cada chat activo
SELECT 
    sc.id as chat_id,
    u.name as user_name,
    cm.message as last_message,
    cm.created_at
FROM support_chats sc
JOIN users u ON sc.user_id = u.id
LEFT JOIN chat_messages cm ON sc.id = cm.chat_id
WHERE cm.id = (
    SELECT id 
    FROM chat_messages 
    WHERE chat_id = sc.id 
    ORDER BY created_at DESC 
    LIMIT 1
)
AND sc.status = 'open';

-- 8. Contar mensajes no leídos para un agente específico
SELECT COUNT(*) as unread_messages
FROM chat_messages cm
JOIN support_chats sc ON cm.chat_id = sc.id
WHERE sc.support_id = 2 
AND sc.status = 'open';

-- 9. Buscar en el historial de mensajes
SELECT 
    cm.*,
    u.name as sender_name
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
WHERE cm.message LIKE '%pedido%'
ORDER BY cm.created_at DESC;

-- ############## FIN CHAT SOPORT ##############