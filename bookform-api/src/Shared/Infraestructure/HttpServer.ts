import express, { Application, Request, RequestHandler, Response } from "express";
import type { EndpointsMap, HttpControllerBuilder } from "./types";
import cors from 'cors';
import { di } from './dependency-injection';
import HttpService from "./Services/HttpService";
import { Server } from 'http';
import { injectable } from "tsyringe";
import { LogService } from "./Services/LogService";
import DomainError from "../Errors/DomainError";

@injectable()
export class HttpServer {

    private app: Application;
    private server: Server | undefined;

    constructor(
        private httpService: HttpService,
        private logService: LogService,
    ) {

        this.app = express();
        // Middleware para agregar el encabezado Access-Control-Allow-Origin
        // this.app.use((req, res, next) => {
        //     res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
        //     next();
        // });
    
        this.app.use(cors());
        this.app.use(express.json());
        this.app.set('trust proxy', true)
    }

    bindEndpoints(endpointsMap: EndpointsMap): void {
        for (const [endpoint, endpointHandler] of Object.entries(endpointsMap)) {
            const colon = endpoint.indexOf(':');
            const method = endpoint.substring(0, colon).trim().toLowerCase() as 'get' | 'post' | 'put' | 'delete';
            const path = endpoint.substring(colon + 1).trim();
            
            if (!['get', 'post', 'put', 'delete'].includes(method)) {
                throw new Error(`El método http "${method}" no está soportado.`);
            }

            let handlers: RequestHandler[];

            if (Array.isArray(endpointHandler)) {
                handlers = endpointHandler.map((handler, index) => {
                    if (index + 1 === endpointHandler.length) {
                        return this.controllerRunner(handler as HttpControllerBuilder);
                    }
                    return handler;
                }) as RequestHandler[];
            } else {
                handlers = [this.controllerRunner(endpointHandler)];
            }

            this.app[method](path, ...handlers);
        }
    }

    start(port: number): Promise<void> {
        return new Promise(resolve => {
            this.server = this.app.listen(port, () => {
                this.logService.log(`El servidor http está preparado en el puerto ${port}.`);
                resolve();
            });
        });
    }

    stop(): Promise<void> {
        return new Promise(resolve => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                resolve();
            });
        });
        
    }

    private controllerRunner(controllerBuilder: HttpControllerBuilder): RequestHandler {
        return async (request: Request, response: Response) => {
            try {
                
                this.logService.log(`Ejecutando controlador en la ruta '${request.originalUrl}'.`);
                const controller = di.resolve(controllerBuilder);
                await controller.execute(request, response);

                // this.updateUserActiviy(request);
            
            } catch (error) {

                const err = error as Error;
                this.logService.log(err);

                /* if (err instanceof DomainError) {
                    this.domainErrorHandler.handle(err, response);
                } else {
                    this.httpService.internalServerError(response, {
                        errorMessage: err.message
                    });
                } */

            } finally {
                if (!response.writableEnded) {
                    response.end();
                }
            }
        };
    }

    /* private async updateUserActiviy(request: Request): Promise<void> {
        const userId = await this.userIdExtractor.softExtractUserId(request);
        if (!userId) {
            return;
        }
        this.userActivityLogger.updateLastActivityDate(userId)
            .then(() => {
                this.logService.log(`Actualizada la actividad del usuario ${userId.value}.`);
            })
            .catch(error => console.log(error));
    } */

}
