import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { LOANS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import LoanRepository from "../Repository/LoanRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { GetLoansService } from "../Services/GetLoansService";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { Loan } from "../Model/Loan";
import { Bool } from "../../Shared/Models/Bool";
import { Uuid } from "../../Shared/Models/Uuid";
import { SecureDate } from "../../Shared/Models/SecureDate";
import { LoanCreateServices } from "../Services/LoanCreateServices";

@injectable()
export class SaveLoanController implements HttpController {
    constructor(
        private httpService: HttpService,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        @inject(LOANS_REPOSITORY) private loanRepository: LoanRepository,
    ){}
    async execute(request: Request, response: Response): Promise<void> {
        try {
            const newLoan = new Bool(request.body.id ? false:true);
            const id = new Uuid(request.body.id ? request.body.id : uuidv4())
            const user_id = new Uuid(request.body.user_id);
            const book_id = new Uuid(request.body.book_id);
            const loan_date = new SecureDate(request.body.loan_date);
            const return_date = new SecureDate(request.body.return_date);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));

            const loan = new Loan(id, user_id, book_id, loan_date, return_date);

            const loanCreateServices = new LoanCreateServices(this.loanRepository);
            await loanCreateServices.execute(loan, newLoan);

            this.httpService.ok(response, { message: 'Préstamo guardado correctamente', loan: loan.getPrimitives()});
        }catch (error: any) {

            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);

        }
    }
}