const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Por favor, introduce un nombre de usuario y una contraseña.",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario ya está registrado." });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Datos de usuario inválidos." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error del servidor al registrar el usuario." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Por favor, introduce tu nombre de usuario y contraseña.",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (usuario no encontrado)." });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (contraseña incorrecta)." });
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor al iniciar sesión." });
  }
});

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Acceso al perfil exitoso",
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

module.exports = router;
