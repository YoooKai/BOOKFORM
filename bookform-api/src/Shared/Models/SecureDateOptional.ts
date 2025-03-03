import ValidationError from "../Errors/ValidationError";

export class SecureDateOptional {

    constructor(public readonly value: Date | null) {
        this.validate();
    }

    private validate(): void | null{

        if (!this.value) {
            return null;
        }

        if (!(this.value instanceof Date)) {
            throw new ValidationError('El valor de SecureDate debe ser una instancia de Date.');
        }

        if (Number.isNaN(this.value.getTime())) {
            throw new ValidationError('El valor de SecureDate no contiene una fecha válida.');
        }

    }

}
