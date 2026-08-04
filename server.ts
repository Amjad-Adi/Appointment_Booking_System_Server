import http from "http";

const PORT: number = 3000;
import {app} from "./app";
import {roleRoute} from "./routes/role.route";
const server = http.createServer(app)
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});