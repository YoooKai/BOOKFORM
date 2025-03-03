import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { User } from "../Model/User";
import UserRepository from "../Repository/UserRepository";
import { USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { AuthService } from "../Services/AuthService";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { Bool } from "../../Shared/Models/Bool";
import { GetUsersService } from "../Services/GetUsersService";


@injectable()
export class GetUsersController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const name = new NameOptional(request.body.name ? request.body.name : null);
            const email = new NameOptional(request.body.email ? request.body.email : null);
            const status = new Bool(request.body.status);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const getUsersService = new GetUsersService(this.userRepository);  
            const users = await getUsersService.execute(name, email, status);
    
            this.httpService.ok(response, users.map((user: User) => user.getPrimitives())); 

        } catch (error: any) {
            
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);
        }

        
    }

}
