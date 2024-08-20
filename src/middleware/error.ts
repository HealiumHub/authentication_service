import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(400).json({
    success: false,
    error: err.detail || err.message || "Server error",
  });
};
