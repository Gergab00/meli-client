// UserReader.js

/**
 * Clase que representa el lector de usuarios.
 * @class
 */
class UserReader {
    /**
     * Represents a UserReader.
     * @constructor
     * @param {MercadoLibreClient} client - The MercadoLibre client.
     */
    constructor(client) {
        this.client = client;
      }

    /**
     * Obtiene la información de usuario.
     * @returns {Promise<Object>} La información de usuario.
     * @throws {Error} Si ocurre un error al obtener la información de usuario.
     */
    async obtenerInformacionDeUsuario() {
        try {
            const response = await this.client.callAPI('/users/me', 'GET');
            return response.data;
        } catch (error) {
            console.error('Error al obtener información de usuario:', error);
            throw error;
        }
    }
}

module.exports = UserReader;