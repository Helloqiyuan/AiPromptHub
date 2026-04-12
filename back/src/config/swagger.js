const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'AI Prompt Hub API',
    version: '1.0.0',
    description: 'AI Prompt Hub 后端接口文档，支持 Swagger UI 在线调试。',
  },
  servers: [
    {
      url: 'http://127.0.0.1:3000',
      description: '本地开发环境',
    },
  ],
  tags: [
    { name: 'Health', description: '服务健康检查' },
    { name: 'Users', description: '用户注册、登录与个人中心' },
    { name: 'Prompts', description: 'Prompt 浏览、创建与互动' },
    { name: 'Comments', description: '评论与评论树' },
    { name: 'Catalog', description: '分类、标签、模型目录' },
    { name: 'Admin', description: '后台管理接口' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [path.resolve(__dirname, '../docs/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
