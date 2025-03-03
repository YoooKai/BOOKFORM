import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Name } from "../../Shared/Models/Name";
import { Uuid } from "../../Shared/Models/Uuid";
import { v4 as uuidv4 } from 'uuid';
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { User } from "../Model/User";
import { UserCreateServices } from "../Services/UserCreateServices";
import UserRepository from "../Repository/UserRepository";
import { USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { AuthService } from "../Services/AuthService";
import { UserPasswordSavedServices } from "../Services/UserPasswordSavedServices ";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { Bool } from "../../Shared/Models/Bool";


@injectable()
export class SaveUserController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const newUser = new Bool(request.body.id ? false : true);
            const id = new Uuid(request.body.id ? request.body.id : uuidv4());
            const name = new Name(request.body.name);
            const email = new Name(request.body.email);
            const status = new Bool(request.body.status ? true : false);
            const password = new NameOptional(request.body.password ? request.body.password : null);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const user = new User(id, name, status, email);

            const userCreated = new UserCreateServices(this.userRepository);  
            await userCreated.execute(user, newUser);

            const preUser = await this.userRepository.getUserById(id);

            if (password.value && preUser) {
                const userPasswordSavedServices = new UserPasswordSavedServices(this.userRepository);
                await userPasswordSavedServices.execute(preUser.id, new Name(password.value));
            }
    
            this.httpService.ok(response, { message: 'Usuario guardado correctamente', user: preUser.getPrimitives() }); 

        } catch (error: any) {

            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);

        }

        
    }

}
