import serverless from "serverless-http";
// @ts-ignore
import app from "../../../../../backend/src/index.ts";

const handler = serverless(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
