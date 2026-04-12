const path = require('path');
const dotenv = require('dotenv');

const envFilePath =
  process.env.ENV_FILE ||
  path.resolve(__dirname, '../../.env');

dotenv.config({
  path: envFilePath,
});

function toBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || 'ai_prompt_hub',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbCharset: process.env.DB_CHARSET || 'utf8mb4',
  jwtSecret: process.env.JWT_SECRET || 'ai-prompt-hub-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  autoSync: toBoolean(process.env.AUTO_SYNC, false),
};
