import ValidationError from "../Errors/ValidationError";

export class SecureDate {

    static now(): SecureDate {
        return new SecureDate(new Date());
    }

    static fromString(date: string): SecureDate {
        return new SecureDate(new Date(date));
    }

    constructor(public readonly value: Date) {
        this.validate();
    }

    private validate(): void {

        if (!(this.value instanceof Date)) {
            throw new ValidationError('El valor de SecureDate debe ser una instancia de Date.');
        }

        if (Number.isNaN(this.value.getTime())) {
            throw new ValidationError('El valor de SecureDate no contiene una fecha válida.');
        }

    }

}
