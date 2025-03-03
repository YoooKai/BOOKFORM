import ValidationError from "../Errors/ValidationError";

export class NameOptional {

    constructor(public readonly value: string | null) {
        this.validate();
    }

    private validate(): void | null {

        if (!this.value) {
            return null;
        }

        if (typeof this.value !== 'string') {
            throw new ValidationError('El nombre debe de ser un string.');
        }

        if (this.value === null) {
          return;
      }
    }

}
