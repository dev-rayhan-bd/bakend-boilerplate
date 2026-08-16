import { TErrorSources, TGenericErrorResponse } from '@/interfaces/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value using regex from duplicate key error message
  const match = err?.message?.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage || 'Entered value'} already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Duplicate Field Value',
    errorSources,
  };
};

export default handleDuplicateError;
