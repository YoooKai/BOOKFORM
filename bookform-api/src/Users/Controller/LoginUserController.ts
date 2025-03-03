import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Name } from "../../Shared/Models/Name";
import UserRepository from "../Repository/UserRepository";
import { USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { GetUserAuth } from "../Services/GetUserAuth";


@injectable()
export class LoginUserController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {

        if (!request.body.email || !request.body.password) {
            throw new Error('Email y password son requeridos');
        }

        const email = new Name(request.body.email);
        const password = new Name(request.body.password);

        try {

            const getUserAuth = new GetUserAuth(this.userRepository);
            const login = await getUserAuth.execute(email, password);
    
            this.httpService.ok(response, login ); 

        } catch (error: any) {

            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);

        }

        
    }

}
