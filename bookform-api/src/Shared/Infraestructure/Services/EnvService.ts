import { injectable } from "tsyringe";

@injectable()
export class EnvService {

    getInt(name: string, defaultValue?: number): number {
        if (process.env[name]) {
            return parseInt(process.env[name]!);
        }
        if (defaultValue === undefined) {
            throw new Error(this.getRequiredErrorMessage(name));
        }
        return defaultValue;
    }

    getString(name: string, defaultValue?: string): string {
        if (name in process.env) {
            return process.env[name]!;
        }
        if (defaultValue === undefined) {
            throw new Error(this.getRequiredErrorMessage(name));
        }
        return process.env[name] ?? defaultValue;
    }

    private getRequiredErrorMessage(name: string): string {
        return `La variable de entorno ${name} es requerida.`;
    }

}
