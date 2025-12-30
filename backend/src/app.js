const express = require('express');
const cors = require('cors');
const authRoutes = require('./api/routes/authRoutes');
const productRoutes = require('./api/routes/productRoutes');
const cartRoutes = require('./api/routes/cartRoutes');
const orderRoutes = require('./api/routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
