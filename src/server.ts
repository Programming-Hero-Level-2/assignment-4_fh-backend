import app from './app';
import config from './config';
import { ENV } from './config/env';

const PORT = config.port || 6000;
async function main() {
  try {
    app.listen(config.port, () => {
      console.log(
        `🚀 Server is running on port ${PORT} in ${ENV.NODE_ENV} mode`,
      );
    });
  } catch (err) {
    console.log(err);
  }
}

main();
