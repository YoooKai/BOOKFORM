import LoanRepository from "../Repository/LoanRepository";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { Bool } from "../../Shared/Models/Bool";
import { Loan } from "../Model/Loan";

export class GetLoansService {
    constructor(
        private loanRepository: LoanRepository,
    ){}
    async execute (user_id: UuidOptional, book_id: UuidOptional, status: Bool): Promise<Loan[]>{
        return await this.loanRepository.getLoans(user_id, book_id, status);
    }
}