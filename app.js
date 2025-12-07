/*
// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mini E-commerce API funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/


// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');

// 🔹 Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Configuración básica Swagger/OpenAPI
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini E-commerce API',
      version: '1.0.0',
      description: 'Documentación de la API de Mini E-commerce (usuarios, productos, carrito y pedidos).',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Aquí leerá los comentarios JSDoc de tus rutas
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 🔹 Endpoint de documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🔹 Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mini E-commerce API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});
