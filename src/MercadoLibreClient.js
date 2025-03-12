// src/MercadoLibreClient.js
const axios = require('axios');
const MercadoLibreAuthAPI = require('./auth/MercadoLibreAuthAPI');
const TokenStore = require('./auth/TokenStore');
const MercadoLibreAuthService = require('./auth/MercadoLibreAuthService');
const Token = require('./models/Token');

/**
 * Cliente para interactuar con la API de MercadoLibre.
 * Maneja automáticamente la autenticación y renovación de tokens.
 * 
 * @class MercadoLibreClient
 * 
 */
class MercadoLibreClient {
    /**
     * Constructor para la clase MercadoLibreClient.
     * Inicializa el almacenamiento de tokens y el servicio de autenticación.
     * @param {object} options - Opciones de configuración.
     * @param {string} [options.appId] - ID de la aplicación de MercadoLibre. Por defecto usa process.env.APP_ID.
     * @param {string} [options.secretKey] - Clave secreta de la aplicación. Por defecto usa process.env.SECRET_KEY.
     * @param {string} [options.redirectUri] - URI de redirección configurada en la aplicación. Por defecto usa process.env.REDIRECT_URI.
     * @param {object} [options.mongoose] - Instancia de mongoose para crear el modelo de tokens.
     * @throws {Error} Si no se proporciona un modelo de tokens válido.
     */
    constructor(options = {}) {
        const {
            appId = process.env.APP_ID,
            secretKey = process.env.SECRET_KEY,
            redirectUri = process.env.REDIRECT_URI,
            tokenModel = options.tokenModel || (options.mongoose ? Token(options.mongoose) : null)
        } = options;
        
        if (!tokenModel) {
            throw new Error("TokenModel no se ha proporcionado. Asegúrate de pasar un modelo de Mongoose válido.");
        }

        const mercadoLibreAuthAPI = new MercadoLibreAuthAPI(appId, secretKey, redirectUri);
        const tokenStore = new TokenStore(tokenModel, appId); // Pasamos tokenModel a TokenStore

        this.authService = new MercadoLibreAuthService(mercadoLibreAuthAPI, tokenStore);
    }

    /**
     * Obtiene el token de acceso almacenado.
     * @returns {string} - El token de acceso válido.
     * @throws {Error} - Si no se encuentra un token disponible.
     */
    async getAccessToken() {
        const tokenData = await this.authService.authorize();
        
        if (!tokenData) {
            throw new Error('Token no disponible.');
        }

        return tokenData.accessToken;
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
