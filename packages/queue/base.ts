export const defaultJobOptions = {
  removeOnComplete: 100,
  removeOnFail: 100,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
};
