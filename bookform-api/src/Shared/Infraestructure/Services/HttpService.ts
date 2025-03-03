import type { Response } from 'express';
import { injectable } from 'tsyringe';

export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_INTERNAL_SERVER_ERROR = 500;

@injectable()
export default class HttpService {

    send(httpCode: number, response: Response, body?: any) {
        response.status(httpCode);
        response.send(body);
    }

    //200 Ok
    ok(response: Response, body?: any) {
        this.send(HTTP_OK, response, body);
    }

    //201 Created
    created(response: Response, body?: any) {
        this.send(HTTP_CREATED, response, body);
    }

    //400 Bad request
    badRequest(response: Response, body?: any) {
        this.send(HTTP_BAD_REQUEST, response, body);
    }

    //401 Unauthorized
    unauthorized(response: Response, body?: any): void {
        this.send(HTTP_UNAUTHORIZED, response, body);
    }

    //404 Not found
    notFound(response: Response, body?: any) {
        this.send(HTTP_NOT_FOUND, response, body);
    }

    //409 Conflict
    conflict(response: Response, body?: any) {
        this.send(HTTP_CONFLICT, response, body);
    }

    //500 Internal server error
    internalServerError(response: Response, body?: any) {
        this.send(HTTP_INTERNAL_SERVER_ERROR, response, body);
    }

}
