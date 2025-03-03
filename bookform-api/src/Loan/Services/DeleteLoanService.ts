import LoanRepository from '../Repository/LoanRepository';
import { Uuid } from '../../Shared/Models/Uuid';

export class DeleteLoanService {
    constructor(
        private loanRepository: LoanRepository
    ){}
    async execute(id: Uuid): Promise<void> {
        await this.loanRepository.removeLoan(id);
    }
}