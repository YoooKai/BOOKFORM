import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import UserRepository from "../Repository/UserRepository";
import { USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { AuthService } from "../Services/AuthService";
import { Uuid } from "../../Shared/Models/Uuid";
import { GetUserByAccessToken } from "../Services/GetUserByAccessToken";


@injectable()
export class GetUserByTokenController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const accessToken = this.extractToken(request.get('Authorization'));

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const getUserService = new GetUserByAccessToken(this.userRepository);  
            const user = await getUserService.execute(accessToken);
    
            this.httpService.ok(response, user ? user.getPrimitives() : null); 

        } catch (error: any) {

            console.log(error.message);
            
            this.httpService.badRequest(response, 'Usuario no encontrado.');

        }

        
    }


    private extractToken(bearerHeader: string | undefined): Uuid {

        if (typeof bearerHeader !== 'string') {
            throw new Error('El encabezado debe ser una cadena de texto.');
        }
    
        const parts = bearerHeader.split(' ');
    
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Formato de encabezado de autorización inválido.');
        }
    
        const token = parts[1]

        return new Uuid(token);

    }

}
