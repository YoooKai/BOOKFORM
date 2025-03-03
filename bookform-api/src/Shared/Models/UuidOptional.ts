import ValidationError from "../Errors/ValidationError";

const UUID_REGEXP = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export class UuidOptional {
    
    constructor(public readonly value: string | null) {
        this.validate();
    }

    protected validate() {

        if (this.value === null) {
            return;
        }

        if (typeof this.value != 'string') {
            throw new ValidationError('El Uuid solo debe de ser una cadena.');
        }

        if (!UUID_REGEXP.test(this.value)) {
            throw new ValidationError('El Uuid debe tener un formato de uuid.');
        }
    }
}
