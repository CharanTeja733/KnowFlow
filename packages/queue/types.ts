export type ProcessDocumentJob = {
  documentId: string;
  userId: string;
  requestId: string;
};

export type SendEmailJob = {
  to: string;
  subject: string;
  html: string;
  requestId: string;
  userId: string;
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
