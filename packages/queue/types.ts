export type ProcessDocumentJob = {
  documentId: string;
  userId: string;
};

export type SendEmailJob = {
    to: string,
    subject: string,
    html: string
};

// Dead letter job (generic + reusable)
export type DeadLetterJob<T = unknown> = {
  originalJobName: string;
  originalQueue: string;
  payload: T;

  errorMessage: string;
  failedAt: string;

  attemptsMade: number;
};