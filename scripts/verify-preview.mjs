import { createPreviewServer } from "./dev-server.mjs";

const server = createPreviewServer();

await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const response = await fetch(`http://127.0.0.1:${port}/`);
const body = await response.text();

server.close();

if (!response.ok) {
  throw new Error(`Expected 200, received ${response.status}`);
}

if (!body.includes("Voy Veo")) {
  throw new Error("Preview HTML did not include the expected title.");
}

console.log(`Preview verification passed on port ${port}`);
