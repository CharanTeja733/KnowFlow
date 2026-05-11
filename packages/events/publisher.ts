import { publish } from "@repo/redis/pubsub";

export async function publishEvent(
  channel: string,
  payload: unknown
) {
  await publish(channel, payload);
}