import { env } from "@repo/env";

export const realtimeConfig = {
  heartbeatInterval:
    env.SSE_HEARTBEAT_INTERVAL_MS,
};