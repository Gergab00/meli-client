require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Clase que maneja el almacenamiento de tokens, ya sea en una base de datos o en un archivo JSON.
 */
class TokenStore {
  /**
   * Constructor para la clase TokenStore.
   * @param {object} TokenModel - Modelo de Mongoose para manejar tokens (opcional).
   * @param {string} serviceName - Nombre del servicio, utilizado como identificador para el token.
   */
  constructor(TokenModel, serviceName = process.env.APP_ID) {
    this.TokenModel = TokenModel;
    this.serviceName = serviceName;
    this.useDatabase = process.env.USE_DATABASE === 'true';
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
      expiresIn: new Date(Date.now() + tokenData.expires_in * 1000),
      userId: tokenData.user_id,
      scope: tokenData.scope,
    };

    if (this.useDatabase && this.TokenModel) {
      await this.TokenModel.findOneAndUpdate({ service: this.serviceName }, tokenToSave, { upsert: true });
    } else {
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokenToSave, null, 2));
    }

    return tokenData;
  }

  /**
   * Recupera los datos del token, ya sea desde la base de datos o desde un archivo JSON.
   * @returns {object|boolean} - Datos del token si se encuentran, de lo contrario, false.
   */
  async getTokenData() {
    let tokenDoc;

    if (this.useDatabase && this.TokenModel) {
      tokenDoc = await this.TokenModel.findOne({ service: this.serviceName });
    } else if (fs.existsSync(this.tokenFilePath)) {
      tokenDoc = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
    }

    if (!tokenDoc) return false;

    return {
      access_token: tokenDoc.accessToken,
      expires_at: new Date(tokenDoc.expiresIn).getTime() / 1000,
      refresh_token: tokenDoc.refreshToken,
      user_id: tokenDoc.userId,
      scope: tokenDoc.scope,
    };
  }

  /**
   * Verifica si el token está expirado.
   * @param {object} tokenData - Datos del token a verificar.
   * @returns {boolean} - True si el token está expirado, de lo contrario, false.
   */
  isTokenExpired(tokenData) {
    return Date.now() > new Date(tokenData.expires_at * 1000);
  }
}

module.exports = TokenStore;
