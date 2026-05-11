import {
  publisher,
  subscriber,
} from "./client";

type Callback = (data: unknown) => void;

const handlers = new Map<
  string,
  Set<Callback>
>();

subscriber.on(
  "message",
  (channel, message) => {
    try {
      const parsed = JSON.parse(message);

      const callbacks =
        handlers.get(channel);

      if (!callbacks) return;

      for (const callback of callbacks) {
        callback(parsed);
      }
    } catch (error) {
      console.error(
        "PubSub message parse error:",
        error
      );
    }
  }
);

export async function publish(
  channel: string,
  payload: unknown
) {
  await publisher.publish(
    channel,
    JSON.stringify(payload)
  );
}

export async function subscribe(
  channel: string,
  callback: Callback
) {
  let callbacks = handlers.get(channel);

  if (!callbacks) {
    callbacks = new Set();

    handlers.set(channel, callbacks);

    await subscriber.subscribe(channel);
  }

  callbacks.add(callback);
}

export async function unsubscribe(
  channel: string,
  callback: Callback
) {
  const callbacks = handlers.get(channel);

  if (!callbacks) return;

  callbacks.delete(callback);

  if (callbacks.size === 0) {
    handlers.delete(channel);

    await subscriber.unsubscribe(channel);
  }
}