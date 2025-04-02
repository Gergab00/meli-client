// src/models/Token.js
/**
 * Represents a token in the application.
 * @typedef {Object} Token
 * @property {string} service - The service associated with the token.
 * @property {string} accessToken - The access token.
 * @property {string} refreshToken - The refresh token.
 * @property {Date} expiresIn - The expiration date of the token.
 * @property {string} userId - The user ID associated with the token.
 * @property {string} [scope] - The scope of the token.
 * @property {Date} createdAt - The creation date of the token.
 * @property {Date} updatedAt - The last update date of the token.
 */
module.exports = (mongoose) => {
  // Verificar si el modelo ya existe para evitar sobrescribirlo
  if (mongoose.models && mongoose.models.Token) {
    return mongoose.models.Token;
  }

  const tokenSchema = new mongoose.Schema({
    service: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresIn: { type: Date, required: true },
    userId: { type: String, required: true },
    scope: { type: String },
  }, {
    timestamps: true,
  });

  return mongoose.model('Token', tokenSchema);
};