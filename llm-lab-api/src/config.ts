import express from "express";
import { createConfig } from "express-zod-api";
import cookieParser from "cookie-parser";
import { customLogger } from "./utils/logger";
import { MAX_FILE_SIZE } from "./constants";
import fileUpload from "express-fileupload";

export const config = createConfig({
  server: {
    listen: { port: Number(process.env.PORT) || 80 },
    compression: true,
    jsonParser: express.json({ limit: "50mb" }),
    rawParser: express.raw(),

    beforeRouting: ({ app }) => {
      app.options("*", (req, res) => {
        res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With"
        );
        res.sendStatus(200);
      });

      app.use(cookieParser());
      app.use(express.urlencoded({ extended: true }));

      app.use(
        fileUpload({
          useTempFiles: true,
          tempFileDir: "/tmp/",
          abortOnLimit: true,
          responseOnLimit: `File size limit has been reached. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          limits: { fileSize: MAX_FILE_SIZE },
        })
      );

      // Serve robots.txt to prevent search engines from crawling the API
      app.get("/robots.txt", (req, res) => {
        res.setHeader("Content-Type", "text/plain");
        res.send(`User-agent: *
Disallow: /
`);
      });
    },
  },
  startupLogo: false,
  cors: ({ defaultHeaders, request }) => ({
    ...defaultHeaders,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": request.headers.origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
  }),
  logger: customLogger,
  tags: {
    experiments: "LLM experiment management",
    metrics: "Quality metrics calculation",
  },
});
