import * as express from 'express';
import helmet from 'helmet';
import { ExpressMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { env } from '../../env';
import { StatusCodes } from 'http-status-codes';
@Middleware({ type: 'before' })
export class SecurityMiddleware implements ExpressMiddlewareInterface {

    public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (req.originalUrl.includes('/swagger/')) {
            return helmet()(req, res, next);
        }
        const allowedClients = env.security.allowedClients.split(',');
        if (!req.headers[`x-client-name`]  || allowedClients.indexOf(req.headers[`x-client-name`].toString()) === -1 ) {
            throw new HttpError(StatusCodes.UNAUTHORIZED, `client name is missing`);
        }
        let validSecret = false;
        switch (req.headers[`x-client-name`]) {
            case 'WEB_APP':
                validSecret = req.headers[`x-client-secret`] === env.security.webClientSecret ? true : false;
                if (!validSecret) {
                    throw new HttpError(StatusCodes.UNAUTHORIZED, `client secret is not valid`);
                }
                break;

            case 'PHELIX_API':
                validSecret = req.headers[`x-client-secret`] === env.security.apiClientSecret ? true : false;
                if (!validSecret) {
                    throw new HttpError(StatusCodes.UNAUTHORIZED, `client secret is not valid`);
                }
                break;
            default:
                throw new HttpError(StatusCodes.UNAUTHORIZED, `client secret is not valid`);
        }
        return helmet()(req, res, next);
    }

}
