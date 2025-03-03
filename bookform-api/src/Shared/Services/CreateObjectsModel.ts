import { User } from "../../Users/Model/User";
import { Bool } from "../Models/Bool";
import { Name } from "../Models/Name";
import { SecureDate } from "../Models/SecureDate";
import { Uuid } from "../Models/Uuid";
import { Book } from "../../Book/Model/Book";
import { Loan } from "../../Loan/Model/Loan";

export function createUser(data: any): User {
    const id = new Uuid(data.id);
    const name = new Name(data.name);
    const email = new Name(data.email);
    const status = new Bool(data.status);

    return new User(id, name, status, email);
}

export function createBook(data: any): Book {
    const id = new Uuid(data.id);
    const title = new Name(data.title);
    const author = new Name(data.author);
    const available = new Bool(data.available)
    
    return new Book(id, title, author, available);
}

export function createLoan(data: any): Loan{
    const id = new Uuid(data.id);
    const user_id = new Uuid(data.id);
    const book_id = new Uuid(data.book_id);
    const loan_date = new SecureDate(data.loan_date);
    const return_date = new SecureDate(data.return_date);

    return new Loan(id, user_id, book_id, loan_date, return_date);
}