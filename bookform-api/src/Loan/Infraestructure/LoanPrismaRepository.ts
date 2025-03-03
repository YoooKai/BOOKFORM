import { inject, injectable } from "tsyringe";
import LoanRepository from "../Repository/LoanRepository"
import { prisma } from "../../Shared/Prisma/prisma";
import { Loan } from "../Model/Loan";
import { LogService } from "../../Shared/Infraestructure/Services/LogService";
import { Uuid } from "../../Shared/Models/Uuid";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { SecureDate } from "../../Shared/Models/SecureDate";
import { Bool } from "../../Shared/Models/Bool";

@injectable()
export default class LoanPrismaRepository implements LoanRepository{
    constructor(
        private logService: LogService,
    ){}
    async saveLoan(loan: Loan): Promise<void> {
        await prisma.loans.upsert({
            where: {
                id: loan.id.value
            },
            update: {
                return_date: loan.return_date.value,
            },
            create: {
                id: loan.id.value,
                user_id: loan.user_id.value,
                book_id: loan.book_id.value,
                loan_date: loan.loan_date.value,
                return_date: loan.return_date.value
            }
        });
    };
    async getLoans(user_id: UuidOptional, book_id: UuidOptional, status: Bool): Promise<Loan[]> {
        const loans = await prisma.loans.findMany({
          where: {
            AND: [
              user_id.value ? { user_id: { equals: user_id.value } } : {},
              book_id.value ? { book_id: { equals: book_id.value } } : {},
              { Users: { status: { equals: status.value } } } // Filtrar por el status del usuario
            ],
          },
          include: {
            Users: true,
            Books: true,
          },
        });
        return loans.map((loan) => this.createLoan(loan));
      }

    async getLoanById(id: Uuid): Promise<Loan> {
        const loan = await prisma.loans.findUnique({
            where: {
                id: id.value
            }
        });
        return this.createLoan(loan);
    }
    async removeLoan(id: Uuid): Promise<void> {
        await prisma.loans.delete({
            where: {
                id: id.value
            }
        });
    }
    private createLoan(data: any): Loan {
        const id = new Uuid(data.id);
        const user_id = new Uuid(data.user_id);
        const book_id = new Uuid(data.book_id);
        const loan_date = new SecureDate(data.loan_date);
        const return_date = new SecureDate(data.return_date);

        return new Loan(id, user_id, book_id, loan_date, return_date);
    }

    
}