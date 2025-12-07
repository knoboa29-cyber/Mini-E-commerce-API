/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */


// routes/products.routes.js
const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, precio, stock FROM producto'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/products:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, precio, stock FROM producto WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Error en GET /api/products/:id:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({
      message: 'nombre, precio y stock son obligatorios'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO producto (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || null, precio, stock]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      descripcion: descripcion || null,
      precio,
      stock
    });
  } catch (err) {
    console.error('Error en POST /api/products:', err);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

module.exports = router;
