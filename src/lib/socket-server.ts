import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma";

export type SocketServer = SocketIOServer;

interface TableSession {
  tableId: string;
  restaurantId: string;
  users: Set<string>;
  capacity: number;
}

const tableSessions = new Map<string, TableSession>();

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"],
    },
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // Join restaurant room (for owners)
    socket.on("join-restaurant", async (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`👔 Owner joined restaurant: ${restaurantId}`);
    });

    // Join table room (for guests)
    socket.on(
      "join-table",
      async (data: { tableId: string; restaurantId: string }) => {
        const { tableId, restaurantId } = data;
        const sessionKey = `${restaurantId}:${tableId}`;

        // Get table capacity from database
        const table = await prisma.table.findUnique({
          where: { id: tableId },
          select: { capacity: true },
        });

        if (!table) {
          socket.emit("table-error", { message: "Table not found" });
          return;
        }

        // Initialize session if doesn't exist
        if (!tableSessions.has(sessionKey)) {
          tableSessions.set(sessionKey, {
            tableId,
            restaurantId,
            users: new Set(),
            capacity: table.capacity,
          });
        }

        const session = tableSessions.get(sessionKey)!;

        // Check if table is full
        if (session.users.size >= session.capacity) {
          socket.emit("table-full", {
            message: "This table is full. Please contact staff.",
            capacity: session.capacity,
            current: session.users.size,
          });
          return;
        }

        // Add user to table session
        session.users.add(socket.id);
        socket.join(`table:${tableId}`);

        // Notify all users in table
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
      }
    );

    // Leave table room
    socket.on("leave-table", (tableId: string) => {
      handleTableLeave(socket.id, tableId, io);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);

      // Remove from all table sessions
      tableSessions.forEach((session, _) => {
        if (session.users.has(socket.id)) {
          handleTableLeave(socket.id, session.tableId, io);
        }
      });
    });
  });

  return io;
}

function handleTableLeave(
  socketId: string,
  tableId: string,
  io: SocketIOServer
) {
  tableSessions.forEach((session, key) => {
    if (session.tableId === tableId && session.users.has(socketId)) {
      session.users.delete(socketId);

      // Notify remaining users
      io.to(`table:${tableId}`).emit("table-users-updated", {
        tableId,
        userCount: session.users.size,
        capacity: session.capacity,
      });

      console.log(
        `👥 Guest left table ${tableId} (${session.users.size}/${session.capacity})`
      );

      // Clean up empty sessions
      if (session.users.size === 0) {
        tableSessions.delete(key);
        console.log(`🧹 Cleaned up empty session for table ${tableId}`);
      }
    }
  });
}

// Helper function to emit events (can be called from API routes)
export function emitOrderEvent(io: SocketIOServer, event: string, data: any) {
  const { restaurantId, tableId } = data;

  // Emit to restaurant (owner)
  io.to(`restaurant:${restaurantId}`).emit(event, data);

  // Emit to table (guests)
  if (tableId) {
    io.to(`table:${tableId}`).emit(event, data);
  }
}

export function emitMenuUpdate(
  io: SocketIOServer,
  restaurantId: string,
  data: any
) {
  // Emit to all tables in restaurant
  io.to(`restaurant:${restaurantId}`).emit("menu-updated", data);
}

export function getTableUserCount(
  restaurantId: string,
  tableId: string
): number {
  const sessionKey = `${restaurantId}:${tableId}`;
  const session = tableSessions.get(sessionKey);
  return session ? session.users.size : 0;
}
