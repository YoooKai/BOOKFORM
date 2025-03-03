import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { BOOKS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import BookRepository from "../Repository/BookRepository";
import { Uuid } from "../../Shared/Models/Uuid";
import { AuthService } from "../../Users/Services/AuthService";
import { GetBookService } from "../Services/GetBookService";

@injectable()
export class GetBookController implements HttpController {
    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        @inject (BOOKS_REPOSITORY) private bookRepository: BookRepository
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const id = new Uuid(request.params.id);
            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            const getBookService = new GetBookService(this.bookRepository);
            const book = await getBookService.execute(id);

            this.httpService.ok(response, book ? book.getPrimitives() : null);
        } catch (error: any){
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, 'Libro no encontrado.');
        }
    }
}  