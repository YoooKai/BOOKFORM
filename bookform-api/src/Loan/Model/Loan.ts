import { SecureDate } from "../../Shared/Models/SecureDate";
import { Uuid } from "../../Shared/Models/Uuid";
import { LoanPrimitives } from "./LoanPrimitives";

export class Loan {
    static fromPrimitives(data: LoanPrimitives): Loan {
        const id = new Uuid(data.id);
        const user_id = new Uuid(data.id);
        const book_id = new Uuid(data.book_id);
        const loan_date = new SecureDate(data.loan_date);
        const return_date = new SecureDate(data.return_date);

        return new Loan(id, user_id, book_id, loan_date, return_date);
    }
    constructor(
        public readonly id: Uuid,
        public readonly user_id: Uuid,
        public readonly book_id: Uuid,
        public readonly loan_date: SecureDate,
        public readonly return_date: SecureDate
    ){}
    getPrimitives(): LoanPrimitives{
        return {
            id: this.id.value,
            user_id: this.user_id.value,
            book_id: this.book_id.value,
            loan_date: this.loan_date.value,
            return_date: this.return_date.value
        }
    }
}