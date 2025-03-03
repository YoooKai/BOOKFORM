import { Request, RequestHandler, Response } from "express";

export interface WsControllerBuilder {
    new(...args: any[]): WsController;
}

export interface WsController {
    execute(clientId: Uuid, messageBody: any): Promise<void>;
}

export interface WsControllerMapping  {
    [controller: string]: WsControllerBuilder;
}

export interface HttpControllerBuilder {
    new(...args: any[]): HttpController;
}

export interface HttpController {
    execute(request: Request, response: Response): Promise<void>;
}

export type EndpointHandler = HttpControllerBuilder | Array<RequestHandler | HttpControllerBuilder>;

export type EndpointsMap = {
    [endpoint: string]: EndpointHandler;
};

export type ComparationOperator = 'eq' | 'like';

export type EventHandler = (data?: any) => any;
