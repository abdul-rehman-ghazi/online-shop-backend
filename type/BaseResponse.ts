type BaseResponse = {
  data: any;
  message: string;
};

export const baseResponse = (data?: any, message?: string) => {
  const response: BaseResponse = {
    data: data ?? null,
    message: message ?? 'Success'
  };
  return response;
};

export const baseErrorResponse = (message?: string) => {
  const response: BaseResponse = {
    data: null,
    message: message ?? 'Failed'
  };
  return response;
};
