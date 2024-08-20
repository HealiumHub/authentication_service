import { Request } from "express";

export const extractBearerToken = (req: Request) => {
  let header = req.headers.authorization;
  if (!header) {
    throw new Error("bad request");
  }

  let components = header.split(" ");
  if (components.length !== 2 || components[0] !== "Bearer") {
    throw new Error("bad request");
  }

  return components[1];
};
