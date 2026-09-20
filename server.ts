import http from "http";
import { app } from "./app";

const PORT = Number(
    process.env.SERVER_PORT ||
    process.env.PORT ||
    3000,
);

const server = http.createServer(app);

server.setTimeout(30000);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

const shutdown = (signal: string) => {
    console.log(
        `[Server] ${signal} received. Closing HTTP server...`,
    );

    server.close(() => {
        console.log("[Server] HTTP server closed cleanly.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("[Server] Forceful shutdown initiated.");
        process.exit(1);
    }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));