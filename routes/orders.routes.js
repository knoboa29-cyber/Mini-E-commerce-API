/**
 * @swagger
 * tags:
 *   name: Órdenes
 *   description: Gestión de compras del usuario
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar órdenes del usuario autenticado
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una orden a partir del carrito
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */


// routes/orders.routes.js
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/orders
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [carritoRows] = await connection.query(
      'SELECT id FROM carrito WHERE usuario_id = ? FOR UPDATE',
      [userId]
    );

    if (carritoRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'El usuario no tiene carrito' });
    }

    const carritoId = carritoRows[0].id;

    const [items] = await connection.query(
      `SELECT 
         ci.producto_id,
         ci.cantidad,
         p.precio,
         p.stock,
         (ci.cantidad * p.precio) AS subtotal
       FROM carrito_item ci
       JOIN producto p ON p.id = ci.producto_id
       WHERE ci.carrito_id = ?`,
      [carritoId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    for (const item of items) {
      if (item.cantidad > item.stock) {
        await connection.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para el producto ${item.producto_id}`
        });
      }
    }

    const total = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

    const [pedidoResult] = await connection.query(
      'INSERT INTO pedido (usuario_id, total, estado) VALUES (?, ?, ?)',
      [userId, total, 'pendiente']
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO pedido_item 
          (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          pedidoId,
          item.producto_id,
          item.cantidad,
          item.precio,
          item.subtotal
        ]
      );

      await connection.query(
        'UPDATE producto SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    await connection.query(
      'DELETE FROM carrito_item WHERE carrito_id = ?',
      [carritoId]
    );

    await connection.commit();

    return res.status(201).json({
      id: pedidoId,
      usuario_id: userId,
      total,
      estado: 'pendiente'
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error en POST /api/orders:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// GET /api/orders
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT id, total, fecha, estado
       FROM pedido
       WHERE usuario_id = ?
       ORDER BY fecha DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/orders:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const pedidoId = req.params.id;

  try {
    const [[pedido]] = await pool.query(
      `SELECT id, usuario_id, total, fecha, estado
       FROM pedido
       WHERE id = ? AND usuario_id = ?`,
      [pedidoId, userId]
    );

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const [items] = await pool.query(
      `SELECT 
         pi.producto_id,
         p.nombre,
         pi.cantidad,
         pi.precio_unitario,
         pi.subtotal
       FROM pedido_item pi
       JOIN producto p ON p.id = pi.producto_id
       WHERE pi.pedido_id = ?`,
      [pedidoId]
    );

    return res.json({
      ...pedido,
      items
    });
  } catch (err) {
    console.error('Error en GET /api/orders/:id:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

module.exports = router;    
