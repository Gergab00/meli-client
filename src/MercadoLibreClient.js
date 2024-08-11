const axios = require('axios');
const MercadoLibreAuthAPI = require('./auth/MercadoLibreAuthAPI');
const TokenStore = require('./auth/TokenStore');
const MercadoLibreAuthService = require('./auth/MercadoLibreAuthService');
const Token = require('./models/Token');
/**
 * Clase que maneja las llamadas a la API de MercadoLibre.
 */
class MercadoLibreClient {
    /**
     * Constructor para la clase MercadoLibreClient.
     * Inicializa el almacenamiento de tokens y el servicio de autenticación.
     * @param {object} options - Opciones de configuración.
     * @param {string} [options.appId] - ID de la aplicación de MercadoLibre.
     * @param {string} [options.secretKey] - Clave secreta de la aplicación.
     * @param {string} [options.redirectUri] - URI de redirección configurada en la aplicación.
     * @param {object} [options.tokenModel] - Modelo de Mongoose para manejar tokens.
     * @param {boolean} [options.useDatabase] - Define si se utiliza la base de datos para almacenar tokens.
     */
    constructor(options = {}) {
        const {
            appId = process.env.APP_ID,
            secretKey = process.env.SECRET_KEY,
            redirectUri = process.env.REDIRECT_URI,
            tokenModel = Token,
        } = options;

        const mercadoLibreAuthAPI = new MercadoLibreAuthAPI(appId, secretKey, redirectUri);
        const tokenStore = new TokenStore(tokenModel, appId);

        this.authService = new MercadoLibreAuthService(mercadoLibreAuthAPI, tokenStore);
    }

    /**
     * Obtiene el token de acceso almacenado.
     * @returns {string} - El token de acceso válido.
     * @throws {Error} - Si no se encuentra un token disponible.
     */
    async getAccessToken() {
        console.log('Obteniendo token de MercadoLibre...');
        const tokenData = await this.authService.authorize();
        if (!tokenData) {
            throw new Error('Token no disponible.');
        }

        return tokenData.access_token;
    }

    /**
     * Realiza una llamada a la API de MercadoLibre.
     * @param {string} endpoint - El endpoint de la API de MercadoLibre.
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE, PATCH).
     * @param {object} data - Los datos a enviar en la solicitud (opcional).
     * @returns {object} - La respuesta de la API.
     * @throws {Error} - Si ocurre un error al llamar a la API.
     */
    async callAPI(endpoint, method, data = {}) {
        try {
            const accessToken = await this.getAccessToken();
            console.log(`Información del token: ${accessToken}`);

            const url = `https://api.mercadolibre.com/${endpoint}`;
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            };

            let response;
            switch (method.toUpperCase()) {
                case 'GET':
                    response = await axios.get(url, { headers });
                    break;
                case 'POST':
                    response = await axios.post(url, data, { headers });
                    break;
                case 'PUT':
                    response = await axios.put(url, data, { headers });
                    break;
                case 'DELETE':
                    response = await axios.delete(url, { headers });
                    break;
                case 'PATCH':
                    response = await axios.patch(url, data, { headers });
                    break;
                default:
                    throw new Error(`Invalid HTTP method: ${method}`);
            }

            return response.data;
        } catch (error) {
            console.error('Error al llamar a la API de MercadoLibre:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = MercadoLibreClient;
