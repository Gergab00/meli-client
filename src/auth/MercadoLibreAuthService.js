require('dotenv').config();

/**
 * Clase que maneja el servicio de autenticación con la API de MercadoLibre.
 */
class MercadoLibreAuthService {
    /**
     * Constructor para la clase MercadoLibreAuthService.
     * @param {MercadoLibreAuthAPI} mercadoLibreAuthAPI - Instancia de la API de autenticación de MercadoLibre.
     * @param {TokenStore} tokenStore - Instancia de TokenStore para manejar la persistencia de tokens.
     */
    constructor(mercadoLibreAuthAPI, tokenStore) {
        this.mercadoLibreAuthAPI = mercadoLibreAuthAPI;
        this.tokenStore = tokenStore;
    }

    /**
     * Maneja el proceso de autorización y obtención del token de acceso.
     * Si no hay datos de token almacenados, solicita un nuevo token.
     * Si el token está expirado, lo renueva.
     * @returns {string} - El token de acceso válido.
     * @throws {Error} - Si no se puede obtener o renovar el token.
     */
    async authorize() {
        let jsonTokenData = await this.tokenStore.getTokenData();

        if (!jsonTokenData) {
            const accessToken = await this.mercadoLibreAuthAPI.getAccessToken(process.env.AUTHORIZATION_CODE);
            jsonTokenData = await this.tokenStore.storeToken(accessToken);
        } else if (this.tokenStore.isTokenExpired(jsonTokenData)) {
            const accessToken = await this.mercadoLibreAuthAPI.refreshToken(jsonTokenData.refresh_token);
            jsonTokenData = await this.tokenStore.storeToken(accessToken);
        }

        return jsonTokenData;
    }
}

module.exports = MercadoLibreAuthService;
