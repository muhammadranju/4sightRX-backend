import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import sendResponse from './shared/sendResponse';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

// ── Swagger UI (/api-docs) ───────────────────────────────────────────────────
// Server needs restart to pick up swagger.yaml changes
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8'),
) as Record<string, unknown>;

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: '4sightRX API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a6b4a; }',
    swaggerOptions: { persistAuthorization: true },
  }),
);

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Beep-beep! The server is alive and kicking. v2',
    data: date,
  });
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
