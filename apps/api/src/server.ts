import { env } from "@repo/env";
import app from "./app";

const PORT = env.PORT || 8000;
app.listen(PORT, () =>
  console.log("server is up and running", "on port", PORT),
);
