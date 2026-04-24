
export class ApiError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string, stack='') {
        super(message);
        this.statusCode = statusCode;

        // Fixes the prototype chain for custom errors in TypeScript
        Object.setPrototypeOf(this, ApiError.prototype);
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}