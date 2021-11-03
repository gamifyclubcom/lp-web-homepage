export interface ICustomError {
  message: string;
  code: ErrorCodes;
}

export enum ErrorCodes {
  TRANSACTION_CANCELLED,
  UN_KNOW_ERROR,
}

export const Errors: {
  [key: string]: ICustomError;
} = {
  TransactionCancelled: {
    message: 'Transaction Cancelled',
    code: ErrorCodes.TRANSACTION_CANCELLED,
  },
  UnKnowError: {
    message: 'Something went wrong, please try again',
    code: ErrorCodes.UN_KNOW_ERROR,
  },
};
