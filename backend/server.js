const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const port = 5001;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let availableOffers = [];

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`A new user connected: ${socket.id}`);

  // Emit available rooms to the newly connected user
  socket.emit("availableRooms", availableOffers);

  // Handle user joining a room
  socket.on("joinRoom", (roomID) => {
    if (!availableOffers.includes(roomID)) {
      availableOffers.push(roomID);
    }
    socket.join(roomID);
    socket.broadcast.emit("joinRoom", availableOffers);
  });

  socket.on("joinOnceAgain", (data) => {
    socket.join(data);
    socket.to(data).emit("playerisJoined", "player is joined");
  });

  socket.on("playerName" , data => {
    console.log(data,"playerName")
    socket.to(data.answerId).emit("playerName",data.playerName1)
  });
  // Handle receiving an offer
  socket.on("offer", (data) => {
    // console.log(data,"offer");
    socket.to(data.roomID).emit("offer", data);
  });

  socket.on("answer", (data) => {
    // console.log(data,"answer")
    socket.to(data.answerId).emit("answer", data);
  });

  socket.on("candidate", (data) => {
    // console.log(data,'candidate')
    socket.to(data.roomId).emit("candidate", data.candidate);
  });

  socket.on("buzzerFirst", (data) => {
    console.log(data)
    socket.to(data.roomId).emit("buzzerFirst", data.elapsedTime);
  });

  socket.on("rightAns",data =>{
    const msg = "Your opponent Chose a Right ans"
    socket.to(data).emit("rightAns",msg)
  })

  socket.on('wrongAns',data => {
    // console.log(data)
    const msg = "If your opponent has chosen an incorrect answer, you now have the opportunity to select the correct one."
    
    socket.to(data).emit("wrongAns",msg)
  })

  socket.on("incomingMessage",(data) => {
    // socket.to(data.)
    // console.log(data)
    socket.to(data.answerId).emit("outgoingMessage",data.text)
  })

  socket.on("endCall",(data) =>{
      console.log(data)
      socket.to(data.answerId).emit("endCall",data.text)
  })
  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});



// Handle HTTP GET request
app.get("/", (req, res) => {
  res.send("Are you commenting the project?");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
