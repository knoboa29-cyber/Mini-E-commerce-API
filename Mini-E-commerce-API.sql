
CREATE DATABASE mini_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mini_ecommerce;
SHOW TABLES;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrito_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE,
    CONSTRAINT uk_carrito_usuario UNIQUE (usuario_id)
) ENGINE=InnoDB;


CREATE TABLE carrito_item (
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (carrito_id, producto_id),
    CONSTRAINT fk_carrito_item_carrito
        FOREIGN KEY (carrito_id) REFERENCES carrito(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_carrito_item_producto
        FOREIGN KEY (producto_id) REFERENCES producto(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','completado','cancelado') NOT NULL DEFAULT 'pendiente',
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE pedido_item (
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (pedido_id, producto_id),
    CONSTRAINT fk_pedido_item_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedido(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pedido_item_producto
        FOREIGN KEY (producto_id) REFERENCES producto(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO producto (nombre, descripcion, precio, stock) VALUES
('Camiseta básica negra', 'Camiseta de algodón unisex, color negro, talla estándar.', 14.99, 50),
('Pantalón jean azul', 'Jean clásico azul, corte recto, ideal para uso diario.', 29.90, 30),
('Zapatillas deportivas', 'Zapatillas deportivas ligeras para correr o caminar.', 49.99, 20),
('Gorra clásica', 'Gorra ajustable, color azul marino con visera curva.', 9.50, 40),
('Mochila casual', 'Mochila de uso diario, compartimento para laptop 15".', 34.75, 15),
('Audífonos inalámbricos', 'Audífonos Bluetooth con estuche de carga.', 24.99, 25),
('Mouse inalámbrico', 'Mouse óptico inalámbrico con receptor USB.', 12.90, 35),
('Teclado mecánico', 'Teclado mecánico retroiluminado para gaming.', 59.99, 10),
('Botella térmica 500ml', 'Botella de acero inoxidable, mantiene temperatura.', 18.50, 40),
('Cuaderno de notas A5', 'Cuaderno de 100 hojas, rayado, tamaño A5.', 3.25, 100);
