const { server, port } = require("./src/server");

server.listen(port, () => {
    console.log(`🚀 Server is up: port ${port}`);
    console.log(`Try: http://localhost:${port}/example/test`);
});
