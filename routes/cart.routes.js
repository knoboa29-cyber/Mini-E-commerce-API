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



// Alias para /api/cart/add usando productId y quantity
router.post('/add', auth, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({
      message: 'productId y quantity (>0) son obligatorios'
    });
  }

  try {
    // Validar producto
    const [prodRows] = await pool.query(
      'SELECT id FROM producto WHERE id = ?',
      [productId]
    );
    if (prodRows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Asegurar carrito
    await pool.query(
      'INSERT INTO carrito (usuario_id) VALUES (?) ON DUPLICATE KEY UPDATE actualizado_en = NOW()',
      [userId]
    );

    const [[carrito]] = await pool.query(
      'SELECT id FROM carrito WHERE usuario_id = ?',
      [userId]
    );
    const carritoId = carrito.id;

    // Insertar/actualizar item
    await pool.query(
      `INSERT INTO carrito_item (carrito_id, producto_id, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
      [carritoId, productId, quantity]
    );

    return res.json({ message: 'Producto agregado/actualizado en el carrito' });
  } catch (err) {
    console.error('Error en POST /api/cart/add:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});
// GET /api/cart → obtener carrito del usuario autenticado
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Obtener carrito del usuario
    const [[carrito]] = await pool.query(
      'SELECT id FROM carrito WHERE usuario_id = ?',
      [userId]
    );

    if (!carrito) {
      return res.json({ items: [] }); // carrito vacío
    }

    const [items] = await pool.query(
      `SELECT ci.producto_id, p.nombre, p.precio, ci.cantidad
       FROM carrito_item ci
       JOIN producto p ON ci.producto_id = p.id
       WHERE ci.carrito_id = ?`,
      [carrito.id]
    );

    return res.json({ items });
  } catch (err) {
    console.error('Error en GET /api/cart:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

module.exports = router;
