import { publish } from "@repo/redis/pubsub";

export async function publishChatChunk(documentId: string, chunk: string) {
  await publish(
    `chat:${documentId}`,

    JSON.stringify({
      type: "chat-token",

      data: chunk,
    }),
  );
}
