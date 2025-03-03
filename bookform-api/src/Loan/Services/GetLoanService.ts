import LoanRepository from '../Repository/LoanRepository';
import { Uuid } from '../../Shared/Models/Uuid';
import { Loan } from '../Model/Loan';

export class GetLoanService {
    constructor(
        private loanRepository: LoanRepository
    ){}
    async executte(id: Uuid): Promise<Loan> {
        return await this.loanRepository.getLoanById(id);
    }
}