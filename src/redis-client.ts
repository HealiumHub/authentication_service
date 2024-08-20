// import { createClient, RedisClientOptions } from "redis";

// const redisOptions: RedisClientOptions = {
//   url: process.env.KV_URL,
//   socket: {
//     tls: true,
//   },
// };

// export const redisClient = createClient(redisOptions);

// (async () => {
//   await redisClient
//     .on("connection", () => {
//       console.log("Redis client connected");
//     })
//     .on("error", (err) => console.log("Redis Client Error", err))
//     .connect();
// })();
