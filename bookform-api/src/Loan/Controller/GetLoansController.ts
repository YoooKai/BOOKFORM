import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { LOANS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import LoanRepository from "../Repository/LoanRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { GetLoansService } from "../Services/GetLoansService";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { Loan } from "../Model/Loan";
import { Bool } from "../../Shared/Models/Bool";

@injectable()
export class GetLoansController implements HttpController{
    constructor(
        private httpService: HttpService,
        @inject (USERS_REPOSITORY) private userRepository: UserRepository,
        @inject (LOANS_REPOSITORY) private loanRepository: LoanRepository
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const user_id = new UuidOptional(request.body.user_id ? request.body.user_id : null);
            const book_id = new UuidOptional(request.body.book_id ? request.body.book_id : null);
            const status = new Bool(request.body.status ?? null); //si el status es de user?

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));

            const getLoansService = new GetLoansService(this.loanRepository);
            const loans = await getLoansService.execute(user_id, book_id, status);

            this.httpService.ok(response, loans.map((loan: Loan) => loan.getPrimitives()));

        } catch (error: any) {
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);
        }
    } 
}