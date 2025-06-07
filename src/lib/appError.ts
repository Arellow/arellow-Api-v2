export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public date: Date;
  
    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.name = 'MMCOOPERRORS';
      this.statusCode = statusCode;
      this.isOperational = true;
      this.date = new Date();
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request', statusCode: number = 400) {
      super(message, statusCode);
    }
  }
  
  export class InternalServerError extends AppError {
    constructor(message: string = 'Something wrong happened.', statusCode: number = 500) {
      super(message, statusCode);
    }
  }
  
  export class UnAuthorizedError extends AppError {
    constructor(message: string = 'Not Authorized access', statusCode: number = 401) {
      super(message, statusCode);
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', statusCode: number = 403) {
      super(message, statusCode);
    }
  }
  
  export class ExpectationFailedError extends AppError {
    constructor(message: string = 'Expected inputs were not supplied', statusCode: number = 417) {
      super(message, statusCode);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', statusCode: number = 404) {
      super(message, statusCode);
    }
  }
  
  export class InvalidError extends AppError {
    constructor(message: string = 'Invalid Input', statusCode: number = 422) {
      super(message, statusCode);
    }
  }
  
  export class DuplicateError extends AppError {
    constructor(message: string = 'Duplicate value', statusCode: number = 406) {
      super(message, statusCode);
    }
  }
  
  export class OkMalformedError extends AppError {
    constructor(message: string = 'ok', statusCode: number = 200) {
      super(message, statusCode);
    }
  }
  