import { Bool } from "../../Shared/Models/Bool";
import { Uuid } from "../../Shared/Models/Uuid";
import { UuidOptional } from "../../Shared/Models/UuidOptional";

export default interface LoanRepository {
    saveLoan(loan: Loan): Promise<void>;
    getLoanById(id: Uuid): Promise<Loan>;
    getLoans(user_id: UuidOptional, book_id: UuidOptional, status: Bool): Promise<Loan[]>;
    removeLoan(id: Uuid): Promise<void>;
}