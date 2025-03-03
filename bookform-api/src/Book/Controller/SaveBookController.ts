import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Uuid } from "../../Shared/Models/Uuid";
import { v4 as uuidv4 } from 'uuid';
import { Name } from "../../Shared/Models/Name";
import { Bool } from "../../Shared/Models/Bool";
import { BOOKS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import BookRepository from "../Repository/BookRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { Book } from "../Model/Book";
import { BookCreateServices } from "../Services/BookCreateServices";


@injectable()
export class SaveBookController implements HttpController {
    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        @inject(BOOKS_REPOSITORY) private bookRepository: BookRepository
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try{
            const newBook = new Bool(request.body.id ? false : true);
            const id = new Uuid(request.body.id ? request.body.id : uuidv4());
            const title = new Name(request.body.name);
            const author = new Name(request.body.author);
            const available = new Bool(request.body.available);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));

            const book = new Book(id, title, author, available);

            const bookCreateServices = new BookCreateServices(this.bookRepository);
            await bookCreateServices.execute(book, newBook);

            this.httpService.ok(response, {message: 'Libro guardado correctamente', book: book.getPrimitives()})

        } catch (error: any) {
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);
        }
    }
}