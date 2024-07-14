// oauth.js
const axios = require('axios');
const querystring = require('querystring');

const clientId = '163a02684273d263746613152d11a5ef513e5dd8';
const clientSecret = 'b96291446dcd1a46a73adb032bf0f9d27f6f9496fb9fc431fd7d90c4fb95';
const redirectUri = 'http://localhost:3000/callback';
const authorizationUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=12`;

const getAccessToken = async (authorizationCode) => {
  try {
    const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', 
      querystring.stringify({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64Credentials}`,
          'Accept': '1.0'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

const getProducts = async (accessToken) => {
  try {
    const response = await axios.get('https://www.bling.com.br/Api/v3/produtos', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

const createProduct = async (accessToken, productData) => {
  try {
    const response = await axios.post('https://bling.com.br/Api/v3/produtos', { produto: productData }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.retorno && response.data.retorno.erros) {
      throw new Error(`Erro ao criar produto: ${response.data.retorno.erros[0].erro.msg}`);
    } else if (response.data && response.data.retorno && response.data.retorno.produto) {
      return response.data.retorno.produto;
    } else {
      throw new Error('Resposta inesperada da API ao criar produto');
    }
  } catch (error) {
    if (error.response) {
      console.error('Erro de validação ao criar produto:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro ao criar produto:', error.message);
    }
    throw error;
  }
};

const updateProduct = async (accessToken, productId, productData) => {
  try {
    const response = await axios.put(`https://www.bling.com.br/Api/v3/produtos/${productId}`, { produto: productData }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.retorno && response.data.retorno.produto) {
      return response.data.retorno.produto;
    } else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error updating product:', error.message);
    throw error;
  }
};

const deleteProduct = async (accessToken, productId) => {
  try {
    await axios.delete(`https://www.bling.com.br/Api/v3/produtos/${productId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error deleting product:', error.message);
    throw error;
  }
};

module.exports = {
  authorizationUrl,
  getAccessToken,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
