import { Server } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.on("room:join", (data) => {
    // console.log({ data });
    const { email, room } = data;
    // for mapping user email and socket
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);

    io.to(socket.id).emit("room:join", data);
  });

  socket.on("call:user", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });

  socket.on("peer:negotiation:needed", ({ to, offer }) => {
    // console.log("peer:negotiation:needed", offer);
    io.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
  });

  socket.on("peer:negotiation:done", ({ to, answer }) => {
    // console.log("peer:negotiation:done", answer);
    io.to(to).emit("peer:negotiation:final", { from: socket.id, answer });
  });
});
