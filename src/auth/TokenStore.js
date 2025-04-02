// src/auth/TokenStore.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Clase que maneja el almacenamiento de tokens, ya sea en una base de datos o en un archivo JSON.
 */
class TokenStore {
  /**
   * Constructor para la clase TokenStore.
   * @param {object} TokenModel - Modelo de Mongoose para manejar tokens.
   * @param {string} serviceName - Nombre del servicio, utilizado como identificador para el token.
   */
  constructor(TokenModel, serviceName = process.env.APP_ID) {
    if (!TokenModel) {
      throw new Error("TokenModel es requerido. Asegúrate de pasar un modelo de Mongoose válido al crear TokenStore.");
    }
    this.TokenModel = TokenModel;
    this.serviceName = serviceName;
    this.useDatabase = process.env.USE_DATABASE === 'true';
    this.mongoURI = process.env.MONGO_URI ? true : false;
    this.tokenFilePath = path.join(__dirname, `${this.serviceName}-token.json`);
  }

  /**
   * Almacena el token, ya sea en la base de datos o en un archivo JSON.
   * @param {object} tokenData - Datos del token a almacenar.
   * @returns {object} - Datos del token almacenado.
   */
  async storeToken(tokenData) {
    const tokenToSave = {
      service: this.serviceName,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: Date.now() + tokenData.expires_in * 1000,  // Almacena el tiempo exacto de expiración
      userId: tokenData.user_id,
      scope: tokenData.scope,
    };

    if (this.useDatabase && this.mongoURI) {
      try {
        await this.TokenModel.findOneAndUpdate({ service: this.serviceName }, tokenToSave, { upsert: true });
      } catch (error) {
        console.error('Error al almacenar el token en la base de datos:', error);
        fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokenToSave, null, 2));
      }
    } else {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokenToSave, null, 2));
    }

    return tokenToSave;
  }

  /**
   * Recupera los datos del token, ya sea desde la base de datos o desde un archivo JSON.
   * @returns {object|boolean} - Datos del token si se encuentran, de lo contrario, false.
   */
  async getTokenData() {
    let tokenDoc;

    if (this.useDatabase && this.mongoURI) {
      try {
        tokenDoc = await this.TokenModel.findOne({ service: this.serviceName });
      } catch (error) {
        console.error('Error al recuperar el token de la base de datos:', error.message);
        if (fs.existsSync(this.tokenFilePath)) {
          tokenDoc = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
          return tokenDoc;
        }
      }
    } else if (fs.existsSync(this.tokenFilePath)) {
      tokenDoc = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
    }

    if (!tokenDoc) return false;

    return tokenDoc;
  }

  /**
   * Verifica si el token está expirado.
   * @param {object} tokenData - Datos del token a verificar.
   * @returns {boolean} - True si el token está expirado, de lo contrario, false.
   */
  isTokenExpired(tokenData) {
    const expirationDate = tokenData.expiresIn;
    const isExpired = Date.now() > expirationDate;
    return isExpired;
  }
}

module.exports = TokenStore;
