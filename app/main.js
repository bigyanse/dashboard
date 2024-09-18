const express = require("express");
const client = require("prom-client");
const logger = require("./utils/logger");
const calculateFibonacci = require("./utils/calculateFibonacci");

const PORT = 5000;

const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

const reqResTime = new client.Histogram({
  name: "http_request_req_res_time",
  help: "Time taken by request and response",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
});

app.use((req, res, next) => {
  const end = reqResTime.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: req.url,
      status_code: res.statusCode,
    });
  });

  next();
});

app.use((req, _res, next) => {
  logger("info", `Incoming request: ${req.method} ${req.url}`, {
    job: "express",
    method: req.method,
    url: req.url,
  });

  next();
});

app.get("/", (req, res) => {
  logger("error", `Request successful`, {
    job: "express",
    method: req.method,
    url: req.url,
  });
  return res.json({ message: `Hello from express server` });
});

app.get("/slow", (req, res) => {
  try {
    const startTime = Date.now();
    const result = calculateFibonacci(4);
    const timeTaken = Date.now() - startTime;

    return res.json({
      status: "Success",
      message: `Heavy task (Fibonacci of 40) completed in ${timeTaken}ms`,
      result: result,
    });
  } catch (error) {
    logger("error", `Error ${error.message}`, {
      job: "express",
      method: req.method,
      url: req.url,
    });
    return res.json({
      status: "Error",
      message: `Heavy task cannot complete`,
    });
  }
});

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`Express Server started at https://localhost:${PORT}`);
});
