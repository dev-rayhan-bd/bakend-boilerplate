import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';

const notFound = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `API Not Found: ${req.method} ${req.originalUrl}`,
    errorSources: [
      {
        path: req.originalUrl,
        message: 'The requested route does not exist on this server.',
      },
    ],
  });
};

export default notFound;
