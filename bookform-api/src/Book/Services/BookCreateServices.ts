import { injectable } from 'tsyringe';
import BookRepository from '../Repository/BookRepository';
import { Book } from "../Model/Book";
import { Bool } from '../../Shared/Models/Bool';

@injectable()
export class BookCreateServices{
    constructor(
        private bookRepository: BookRepository,
    ) {}
    async execute(book: Book, newBook: Bool): Promise<void> {
        try {
            const preBook = await this.bookRepository.getBookById(book.id);
            if (preBook && newBook.value) {
                throw new Error('Book already exists');
            }
            await this.bookRepository.saveBook(book);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}