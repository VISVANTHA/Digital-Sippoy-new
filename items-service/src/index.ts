import { createServer } from "./server";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

createServer().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`items-service listening on :${PORT}`);
});
