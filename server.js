// server.js
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const { authorizationUrl, getAccessToken, getProducts, createProduct } = require('./oauth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key', // use a secure key in production
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

app.get('/authorize', (req, res) => {
  res.redirect(authorizationUrl);
});

app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;
  if (!authorizationCode) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    const accessToken = await getAccessToken(authorizationCode);
    req.session.accessToken = accessToken;
    res.send(`Access Token: ${accessToken}`);
  } catch (error) {
    console.error('Error getting access token:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    res.status(500).send('Error getting access token');
  }
});

app.get('/products', async (req, res) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(400).send('Access token is missing');
  }

  try {
    const products = await getProducts(accessToken);
    res.render('products', { products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Error fetching products');
  }
});

app.post('/products', async (req, res) => {
  console.log('Dados do produto recebidos:', req.body);

  const accessToken = req.session.accessToken;
  const { nome, preco, codigo, tipo, situacao, formato } = req.body;

  if (!accessToken) {
    return res.status(400).send('Token de acesso ausente');
  }

  // Ensure correct field mapping
  const validTipos = ["P", "S", "N"];
  const validFormatos = ["E", "V", "S"];

  if (!validTipos.includes(tipo)) {
    return res.status(400).send(`Tipo inválido: ${tipo}`);
  }

  if (!validFormatos.includes(formato)) {
    return res.status(400).send(`Formato inválido: ${formato}`);
  }

  const productData = {
    nome, 
    preco: parseFloat(preco),
    codigo,
    tipo,
    situacao,
    formato,
  };

  console.log('Dados do produto enviados à API:', productData);

  try {
    const newProduct = await createProduct(accessToken, productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erro ao criar produto:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).send('Erro ao criar produto');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
