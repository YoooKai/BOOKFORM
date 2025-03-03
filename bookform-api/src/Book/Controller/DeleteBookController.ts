import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import { BOOKS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import BookRepository from "../Repository/BookRepository";
import  HttpService  from "../../Shared/Infraestructure/Services/HttpService"
import { Request, Response } from "express";
import { Uuid } from "../../Shared/Models/Uuid";
import { AuthService } from "../../Users/Services/AuthService";
import { DeleteBookService } from "../Services/DeleteBookService";

@injectable()
export class DeleteBookController implements HttpController {
    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        @inject(BOOKS_REPOSITORY) private bookRepository: BookRepository
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const id = new Uuid(request.body.id);
            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            const deleteBookService = new DeleteBookService(this.bookRepository);
            await deleteBookService.execute(id);
            this.httpService.ok(response, 'Libro eliminado correctamente');

        } catch(error: any){
            if (error.message === 'No tiene permiso para realizar esta acción.'){
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, 'Error al eliminar el libro.')
        }
    }
}