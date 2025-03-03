import 'reflect-metadata';
import { HttpServer } from "./src/Shared/Infraestructure/HttpServer";
import { EnvService } from "./src/Shared/Infraestructure/Services/EnvService";
import { di } from "./src/Shared/Infraestructure/dependency-injection";
import { SaveUserController } from './src/Users/Controller/SaveUserController';
import { LoginUserController } from './src/Users/Controller/LoginUserController';
import { GetUsersController } from './src/Users/Controller/GetUsersController';
import { GetUserController } from './src/Users/Controller/GetUserController';
import { DeleteUserController } from './src/Users/Controller/DeleteUserController';
import { GetUserByTokenController } from './src/Users/Controller/GetUserByTokenController';
import { GetBookController } from './src/Book/Controller/GetBookController';
import { SaveBookController } from './src/Book/Controller/SaveBookController';
import { DeleteBookController } from './src/Book/Controller/DeleteBookController';
import { GetBooksController } from './src/Book/Controller/GetBooksController';
import { GetLoanController } from './src/Loan/Controller/GetLoanController';
import { SaveLoanController } from './src/Loan/Controller/SaveLoanController';
import { DeleteLoanController } from './src/Loan/Controller/DeleteLoanController';
import { GetLoansController } from './src/Loan/Controller/GetLoansController';

const envService = di.resolve(EnvService);
const httpServer = di.resolve(HttpServer);

const httpPort = envService.getInt('PORT');

httpServer.bindEndpoints({

    'POST:/login'            : LoginUserController,
    'POST:/create_user'      : SaveUserController,
    'POST:/get_users'        : GetUsersController,
    'GET:/get_user/:id'      : GetUserController,
    'GET:/get_user_by_token' : GetUserByTokenController,
    'POST:/delete_user'      : DeleteUserController,


    'POST:/create_book'      : SaveBookController,
    'POST:/get_books'        : GetBooksController,
    'GET:/get_book/:id'      : GetBookController,
    'POST:/delete_book'      : DeleteBookController,

    'POST:/create_loan'      : SaveLoanController,
    'POST:/get_loans'        : GetLoansController,
    'GET:/get_loan/:id'      : GetLoanController,
    'POST:/delete_loan'      : DeleteLoanController,



    
});

async function startServer(): Promise<void> {
    await Promise.all([
        httpServer.start(httpPort)
    ]).then(() => {
        console.log(`El servidor está listo.`);
    });
}

async function stopServer(): Promise<void> {
    console.log('Deteniendo el servidor.');
    await Promise.all([
        httpServer.stop(),
    ]);
    process.exit();
}

startServer();

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);