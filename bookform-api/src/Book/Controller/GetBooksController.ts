import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { BOOKS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import BookRepository from "../Repository/BookRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { GetBooksService } from "../Services/GetBooksService";
import { Book } from "../Model/Book";

@injectable()
export class GetBooksController implements HttpController {
    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        @inject(BOOKS_REPOSITORY) private bookRepository: BookRepository,
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const author = new NameOptional(request.body.author ? request.body.author : null);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const getBooksService = new GetBooksService(this.bookRepository);
            const books = await getBooksService.execute(author);

            this.httpService.ok(response, books.map((book: Book) => book.getPrimitives()))
        } catch (error: any) {

        if (error.message === 'No tiene permiso para realizar esta acción.') {
            this.httpService.unauthorized(response, error.message);
        }
        this.httpService.badRequest(response, error.message);

        }   
    }
}