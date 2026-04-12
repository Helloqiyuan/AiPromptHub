const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function bootstrap() {
  try {
    await sequelize.authenticate();

    if (env.autoSync) {
      await sequelize.sync({ alter: false });
    }

    app.listen(env.port, () => {
      console.log(`AI Prompt Hub backend is running at http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

