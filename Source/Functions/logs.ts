// utils/logger.ts
import { logger } from 'react-native-logs';

const config = {
  severity: 'debug',
  transport: console.log,
  transportOptions: {
    colors: {
      info: 'blue',
      warn: 'yellow',
      error: 'red',
      debug: 'green',
    },
  },
};

const log = logger.createLogger(config);

export default log;
