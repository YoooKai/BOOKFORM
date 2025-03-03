import { injectable } from "tsyringe";

@injectable()
export class LogService {

    private dateFormatter = new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'long'
    });

    log(...args: any[]): void {
        const date = this.dateFormatter.format(new Date);
        console.log(`[${date}]`, ...args);
    }

}
