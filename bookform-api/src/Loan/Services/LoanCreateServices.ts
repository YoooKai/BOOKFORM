import { injectable } from 'tsyringe';
import LoanRepository from '../Repository/LoanRepository';
import { Loan } from "../Model/Loan";
import { Bool } from '../../Shared/Models/Bool';

@injectable()
export class LoanCreateServices{
    constructor(
        private loanRepositotry: LoanRepository,
    ){}
    async execute(loan: Loan, newLoan: Bool): Promise<void>{
        try {
            const preLoan = await this.loanRepositotry.getLoanById(loan.id)
            if(preLoan && newLoan){
                throw new Error('El préstamo ya existe');
            }
            await this.loanRepositotry.saveLoan(loan);
        } catch (error: any){
            throw new Error(error.message);
        }
    }
}