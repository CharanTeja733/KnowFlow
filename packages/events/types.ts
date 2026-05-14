export enum DocumentEventType {
  STATUS = "STATUS",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type DocumentStatusEvent = {
  type: DocumentEventType.STATUS;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
};

export type DocumentProgressEvent = {
  type: DocumentEventType.PROGRESS;
  completedChunks: number;
  totalChunks: number;
  progressPercentage: number;
};

export type DocumentCompletedEvent = {
  type: DocumentEventType.COMPLETED;
  summary: string;
};

export type DocumentFailedEvent = {
  type: DocumentEventType.FAILED;
  error: string;
};

export type DocumentEvent =
  | DocumentStatusEvent
  | DocumentProgressEvent
  | DocumentCompletedEvent
  | DocumentFailedEvent;
