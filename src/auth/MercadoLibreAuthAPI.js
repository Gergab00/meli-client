const axios = require('axios');

// URLs de los endpoints de MercadoLibre
const AUTHORIZATION_ENDPOINT = 'https://auth.mercadolibre.com.mx/authorization';
const TOKEN_ENDPOINT = 'https://api.mercadolibre.com/oauth/token';
const USER_DATA_ENDPOINT = 'https://api.mercadolibre.com/users/me';

/**
 * Clase que maneja la autenticación con la API de MercadoLibre.
 */
class MercadoLibreAuthAPI {
  /**
   * Constructor para la clase MercadoLibreAuthAPI.
   * @param {string} appId - ID de la aplicación de MercadoLibre.
   * @param {string} secretKey - Clave secreta de la aplicación.
   * @param {string} redirectUri - URI de redirección configurada en la aplicación.
   */
  constructor(appId, secretKey, redirectUri) {
    this.appId = appId;
    this.secretKey = secretKey;
    this.redirectUri = redirectUri;
  }

  /**
   * Genera la URL de autorización para redirigir al usuario.
   * @returns {string} - URL de autorización.
   */
  getAuthorizationUrl() {
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.appId,
      redirect_uri: this.redirectUri,
    });
    return `${AUTHORIZATION_ENDPOINT}?${queryParams}`;
  }

  /**
   * Obtiene el token de acceso utilizando un código de autorización.
   * @param {string} code - Código de autorización recibido.
   * @param {string} codeVerifier - Código verificador para la autenticación.
   * @returns {object} - Datos del token de acceso.
   * @throws {Error} - Si no se puede obtener el token de acceso.
   */
  async getAccessToken(code, codeVerifier) {
    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', this.appId);
    data.append('client_secret', this.secretKey);
    data.append('code', code);
    data.append('redirect_uri', this.redirectUri);
    data.append('code_verifier', codeVerifier);

    try {
      const response = await axios.post(TOKEN_ENDPOINT, data);
      return response.data;
    } catch (error) {
      console.error('Error while getting access token:', error.response?.data || error.message);
      throw new Error('Failed to get access token from MercadoLibre API.');
    }
  }

  /**
   * Refresca el token de acceso utilizando un token de refresco.
   * @param {string} refreshToken - Token de refresco.
   * @returns {object} - Nuevos datos del token de acceso.
   * @throws {Error} - Si no se puede refrescar el token de acceso.
   */
  async refreshToken(refreshToken) {
    const data = new URLSearchParams();
    data.append('grant_type', 'refreshToken');
    data.append('client_id', this.appId);
    data.append('client_secret', this.secretKey);
    data.append('refreshToken', refreshToken);

    try {
      const response = await axios.post(TOKEN_ENDPOINT, data);
      return response.data;
    } catch (error) {
      console.error('Error while refreshing access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token from MercadoLibre API.');
    }
  }

  /**
   * Obtiene los datos del usuario autenticado utilizando el token de acceso.
   * @param {string} accessToken - Token de acceso válido.
   * @returns {object} - Datos del usuario.
   * @throws {Error} - Si no se pueden obtener los datos del usuario.
   */
  async getUserData(accessToken) {
    try {
      const response = await axios.get(USER_DATA_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error while fetching user data:', error.response?.data || error.message);
      throw new Error('Failed to fetch user data from MercadoLibre API.');
    }
  }
}

module.exports = MercadoLibreAuthAPI;
