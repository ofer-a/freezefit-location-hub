import app from './app.js'
import config from './config/index.js'
import { createLogger } from './utils/logger.js'

const logger = createLogger('SERVER')
const PORT = config.server.port;

app.listen(PORT, () => {
    logger.info(`Application started and running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.server.env}`);
})

