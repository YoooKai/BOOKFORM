import BookRepository from "../Repository/BookRepository"
import { inject, injectable } from "tsyringe";
import { prisma } from "../../Shared/Prisma/prisma";
import { Book } from "../Model/Book";
import { LogService } from "../../Shared/Infraestructure/Services/LogService";
import { Uuid } from "../../Shared/Models/Uuid";
import {Name } from "../../Shared/Models/Name";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { Bool } from "../../Shared/Models/Bool";

@injectable()
export default class BookPrismaRepository implements BookRepository{
    constructor(
        private logService: LogService,
    ){}
    async saveBook(book: Book): Promise<void> {
        await prisma.books.upsert({
            where: {
                id: book.id.value
            },
            update: {
                title: book.title.value,
                author: book.author.value,
                available: book.available.value
            },
            create: {
                id: book.id.value,
                title: book.title.value,
                author: book.author.value,
                available: book.available.value
            }
        });
    };
    async getBooks(author: NameOptional): Promise<Book[]>{
        const books = await prisma.books.findMany({
            where: {
                AND: [
                    author.value ? {
                        OR: [
                            {author: {startsWith: author.value}},
                            {author: {endsWith: author.value}}
                        ],
                    }: {},
                ]
            }
        });
        return books.map(book => this.createBook(book));
    }

    async getBookById(id: Uuid): Promise<Book> {
        const book = await prisma.books.findUnique({
            where: {
                id: id.value
            }
        });
        return this.createBook(book);
    }

    async getBookByTitle(title: Name): Promise<Book | null>{
        const book = await prisma.books.findFirst({
            where: {
                title: title.value
            }
            
        });
        if(!title){
            return null
        }
        return this.createBook(book);
    }
    async removeBook(id: Uuid): Promise<void> {
        await prisma.books.delete({
            where: {
                id: id.value
            }
        });
    }
    private createBook(data:any): Book {
        const id = new Uuid(data.id);
        const title = new Name(data.title);
        const author = new Name(data.author);
        const available = new Bool(data.available)
    
    return new Book(id, title, author, available);
    }

    



}