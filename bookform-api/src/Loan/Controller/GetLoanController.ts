import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Uuid } from "../../Shared/Models/Uuid";
import { LOANS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import LoanRepository from "../Repository/LoanRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { DeleteLoanService } from "../Services/DeleteLoanService";
import { GetLoanService } from "../Services/GetLoanService";

@injectable()
export class GetLoanController implements HttpController{
    constructor(
        private httpService: HttpService,
        @inject (USERS_REPOSITORY) private userRepository: UserRepository,
        @inject (LOANS_REPOSITORY) private loanRepository: LoanRepository
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const id = new Uuid(request.params.id);
            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            const getLoanService = new GetLoanService(this.loanRepository);
            const loan = await getLoanService.executte(id);
            this.httpService.ok(response, loan ? loan.getPrimitives() : null);
        } catch (error: any){
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, 'Préstamo no encontrado.');
        }
    }
}