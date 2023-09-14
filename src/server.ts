import { fastify } from "fastify";

const app = fastify();

app.get("/", (req, res) => {
  return "Hello world!";
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Listening on port 3333");
  });
