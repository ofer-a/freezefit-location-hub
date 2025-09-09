import express from 'express'
import cors from 'cors'
import routes from "./routes/index.js"
import { createLogger } from './utils/logger.js'

const logger = createLogger('HTTP')

const app = express();


app.use((req, res, next) => {
  logger.http(`${req.method} request to ${req.url}`);
  
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? 'warn' : 'http';
    
    logger[logLevel](`Response ${statusCode} sent for ${req.method} ${req.url}`);
  });
  
  next();
});

app.use(cors())
app.use(express.json())


app.use("/api", routes)

export default app

