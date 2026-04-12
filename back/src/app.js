const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const createError = require('http-errors');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerSpec = require('./config/swagger');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'AI Prompt Hub Swagger Docs',
}));

app.use('/api', routes);

app.use((req, res, next) => {
  next(createError(404, '接口不存在'));
});

app.use(errorHandler);

module.exports = app;
