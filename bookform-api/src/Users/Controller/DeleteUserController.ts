import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Uuid } from "../../Shared/Models/Uuid";
import UserRepository from "../Repository/UserRepository";
import { USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { AuthService } from "../Services/AuthService";
import { DeleteUserService } from "../Services/DeleteUserService";

@injectable()
export class DeleteUserController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const id = new Uuid(request.body.id);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const deleteUserService = new DeleteUserService(this.userRepository);  
            await deleteUserService.execute(id);
    
            this.httpService.ok(response, 'Usuario eliminado correctamente'); 

        } catch (error: any) {

            console.log(error.message);
            this.httpService.badRequest(response, 'Error al eliminar el usuario.');

        }
    }
}
