/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Operaciones del carrito de compras
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener el carrito del usuario autenticado
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito encontrado
 */

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Agregar un producto al carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 2
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 */



// routes/cart.routes.js
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'INSERT INTO carrito (usuario_id) VALUES (?) ON DUPLICATE KEY UPDATE actualizado_en = NOW()',
      [userId]
    );

    const [[carrito]] = await pool.query(
      'SELECT id FROM carrito WHERE usuario_id = ?',
      [userId]
    );

    const carritoId = carrito.id;

    const [items] = await pool.query(
      `SELECT 
         ci.producto_id,
         p.nombre,
         p.precio,
         ci.cantidad,
         (p.precio * ci.cantidad) AS subtotal
       FROM carrito_item ci
       JOIN producto p ON p.id = ci.producto_id
       WHERE ci.carrito_id = ?`,
      [carritoId]
    );

    const total = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

    return res.json({
      items,
      total
    });
  } catch (err) {
    console.error('Error en GET /api/cart:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

// POST /api/cart/items
router.post('/items', auth, async (req, res) => {
  const userId = req.user.id;
  const { producto_id, cantidad } = req.body;

  if (!producto_id || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: 'producto_id y cantidad (>0) son obligatorios' });
  }

  try {
    const [prodRows] = await pool.query(
      'SELECT id FROM producto WHERE id = ?',
      [producto_id]
    );

    if (prodRows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await pool.query(
      'INSERT INTO carrito (usuario_id) VALUES (?) ON DUPLICATE KEY UPDATE actualizado_en = NOW()',
      [userId]
    );

    const [[carrito]] = await pool.query(
      'SELECT id FROM carrito WHERE usuario_id = ?',
      [userId]
    );

    const carritoId = carrito.id;

    await pool.query(
      `INSERT INTO carrito_item (carrito_id, producto_id, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
      [carritoId, producto_id, cantidad]
    );

    return res.json({ message: 'Producto agregado/actualizado en el carrito' });
  } catch (err) {
    console.error('Error en POST /api/cart/items:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

module.exports = router;
