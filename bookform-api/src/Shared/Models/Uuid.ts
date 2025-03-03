import ValidationError from "../Errors/ValidationError";

const UUID_REGEXP = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export class Uuid {
    
    constructor(public readonly value: string) {
        this.validate();
    }

    protected validate() {
        
        if (typeof this.value != 'string') {
            throw new ValidationError('El Uuid solo debe de ser una cadena.');
        }

        if (!this.value) {
            throw new ValidationError('El Uuid no puede estar vacío.');
        }

        if (!UUID_REGEXP.test(this.value)) {
            throw new ValidationError('El Uuid debe tener un formato de uuid.');
        }
    }
}
