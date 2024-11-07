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
    user_id INT NOT NULL,
    support_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    support_document VARCHAR(255),
    support_response VARCHAR(255),
    status VARCHAR(255) NOT NULL
);

CREATE TABLE support_chats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    agent_id INT,
    message TEXT NOT NULL,
    status ENUM('open', 'closed', 'converted_to_ticket') NOT NULL DEFAULT 'open',
    ticket_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
);

CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT,
    user_id INT NOT NULL,
    agent_id INT,
    subject VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    description TEXT NOT NULL,
    resolution_notes TEXT,
    resolution_type ENUM('chat_converted', 'direct_ticket') NOT NULL DEFAULT 'direct_ticket',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES support_chats(id)
);