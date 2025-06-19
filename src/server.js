require("dotenv").config();

const express = require("express");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();  

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

app.get("/", (req, res) => {
  res.send("¡Servidor de autenticación y publicaciones en funcionamiento!");
});

app.use("/api", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});