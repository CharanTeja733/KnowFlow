export type ChatDocumentParams = {
  id: string;
};

export type ChatDocumentBody = {
  question: string;
};

export type ChatDocumentResponse = {
  answer: string;

  sources: {
    chunkIndex: number;
    similarity: number;
  }[];
};
