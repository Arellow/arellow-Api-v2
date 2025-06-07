import { Response as ExpressResponse } from 'express';

export default class Response {

  private code: number;
  private success: boolean;
  private message: string | string[];
  private data: any;
  res: ExpressResponse<any, Record<string, any>>;

  constructor(code: number, success: boolean, message: string | string[], res: ExpressResponse, data?: any) {
    this.code = code;
    this.success = success;
    this.message = message;
    this.data = data;
    this.res = res;
    this.sendResponse(res);
  }

  private sendResponse(res: ExpressResponse) {
    if (this.data) {
      return res.status(this.code).send({
        success: this.success,
        message: this.message,
        data: this.data
      });
    } else {
      return res.status(this.code).send({
        success: this.success,
        message: this.message
      });
    }
  }
}