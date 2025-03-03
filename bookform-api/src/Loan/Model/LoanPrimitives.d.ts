import { UserPrimitives } from "../../User/Model/UserPrimitives";
import { BookPrimitives } from "../../Book/Model/BookPrimitives";

export interface LoanPrimitives {
    id: string;
    user_id: string;
    book_id: string;
    loan_date: Date;
    return_date: Date;
}