const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const { Server } = require("socket.io");
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"],
    },
    path: "/api/socket",
  });

  // Store IO instance globally
  global.io = io;

  // Table session management
  const tableSessions = new Map();

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("join-restaurant", (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`👔 Owner joined restaurant: ${restaurantId}`);
    });

    socket.on("join-table", async (data) => {
      const { tableId, restaurantId, capacity } = data;
      const sessionKey = `${restaurantId}:${tableId}`;

      if (!tableSessions.has(sessionKey)) {
        tableSessions.set(sessionKey, {
          tableId,
          restaurantId,
          users: new Set(),
          capacity: capacity || 4,
        });
      }

      const session = tableSessions.get(sessionKey);

      if (session.users.size >= session.capacity) {
        socket.emit("table-full", {
          message: "This table is full. Please contact staff.",
          capacity: session.capacity,
          current: session.users.size,
        });
        return;
      }

      session.users.add(socket.id);
      socket.join(`table:${tableId}`);

      io.to(`table:${tableId}`).emit("table-users-updated", {
        tableId,
        userCount: session.users.size,
        capacity: session.capacity,
      });

      console.log(
        `👥 Guest joined table ${tableId} (${session.users.size}/${session.capacity})`
      );

      socket.emit("table-joined", {
        tableId,
        userCount: session.users.size,
        capacity: session.capacity,
      });
    });

    socket.on("leave-table", (tableId) => {
      handleTableLeave(socket.id, tableId);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
      tableSessions.forEach((session) => {
        if (session.users.has(socket.id)) {
          handleTableLeave(socket.id, session.tableId);
        }
      });
    });

    function handleTableLeave(socketId, tableId) {
      tableSessions.forEach((session, key) => {
        if (session.tableId === tableId && session.users.has(socketId)) {
          session.users.delete(socketId);

          io.to(`table:${tableId}`).emit("table-users-updated", {
            tableId,
            userCount: session.users.size,
            capacity: session.capacity,
          });

          console.log(
            `👥 Guest left table ${tableId} (${session.users.size}/${session.capacity})`
          );

          if (session.users.size === 0) {
            tableSessions.delete(key);
            console.log(`🧹 Cleaned up empty session for table ${tableId}`);
          }
        }
      });
    }
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
