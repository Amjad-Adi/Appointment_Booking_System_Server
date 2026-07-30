import http from "http";

const PORT: number = 3000;
import {app} from "./app";
import {roleRoutes} from "./routes/role.routes";

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello from TypeScript HTTP server!\n");
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
app.use("/",roleRoutes);