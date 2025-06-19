const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Post = require("../models/Post");

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    message: `¡Bienvenido al dashboard de administración, ${req.user.username}!`,
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      message: "Usuarios obtenidos exitosamente",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios (admin):", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener los usuarios." });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json({
      message: "Usuario obtenido exitosamente",
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }
    console.error("Error al obtener usuario por ID (admin):", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener el usuario." });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({
          message: 'Rol inválido. Los roles permitidos son "user" o "admin".',
        });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado para actualizar rol." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `Rol de usuario ${user.username} actualizado a ${user.role} exitosamente.`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }
    console.error("Error al actualizar rol de usuario (admin):", error);
    res
      .status(500)
      .json({
        message: "Error del servidor al actualizar el rol del usuario.",
      });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "Un administrador no puede eliminarse a sí mismo." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado para eliminar." });
    }

    await User.deleteOne({ _id: userId });

    res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }
    console.error("Error al eliminar usuario (admin):", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar el usuario." });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Publicación no encontrada para eliminar." });
    }

    await Post.deleteOne({ _id: postId });
    res
      .status(200)
      .json({
        message: "Publicación eliminada por administrador exitosamente.",
      });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de publicación inválido." });
    }
    console.error("Error al eliminar publicación (admin):", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la publicación." });
  }
});

router.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ message: "Comentario no encontrado en esta publicación." });
    }

    post.comments.splice(commentIndex, 1);

    await post.save();

    res
      .status(200)
      .json({
        message: "Comentario eliminado por administrador exitosamente.",
      });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "ID de publicación o comentario inválido." });
    }
    console.error("Error al eliminar comentario (admin):", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar el comentario." });
  }
});

module.exports = router;
