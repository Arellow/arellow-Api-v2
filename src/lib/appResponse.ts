function formatMessage(objectOrMessage: string | { message?: string }): string {
    if (typeof objectOrMessage === "string") {
      return objectOrMessage;
    }
  
    if (typeof objectOrMessage === "object" && objectOrMessage.message) {
      return objectOrMessage.message;
    }
  
    return "";
  }
  
  interface Response<T> {
    success: boolean;
    message: string;
    data: T | null;
  }
  
  function createResponse<T>(
    objectOrMessage: string | { message?: string },
    data: T | null = null,
    success: boolean | null = null
  ): Response<T> {
    return {
      success: success === null ? true : success,
      message: formatMessage(objectOrMessage),
      data,
    };
  }
  
  export default createResponse;
  