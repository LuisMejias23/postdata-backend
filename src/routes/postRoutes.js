const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "El contenido de la publicación no puede estar vacío.",
    });
  }

  if (content.length > 280) {
    return res.status(400).json({
      message:
        "El contenido de la publicación no puede exceder los 280 caracteres.",
    });
  }

  try {
    const newPost = await Post.create({
      user: req.user._id,
      content,
    });

    const populatedPost = await newPost.populate("user", "username");

    res.status(201).json({
      message: "Publicación creada exitosamente",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error al crear la publicación:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al crear la publicación." });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Publicaciones obtenidas exitosamente",
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error al obtener las publicaciones:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las publicaciones." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("user", "username")
      .populate("comments.user", "username");

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    res.status(200).json({
      message: "Publicación obtenida exitosamente",
      post,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de publicación inválido." });
    }
    console.error("Error al obtener la publicación por ID:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener la publicación." });
  }
});

router.post("/:id/comments", protect, async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res
      .status(400)
      .json({ message: "El comentario no puede estar vacío." });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Publicación no encontrada para comentar." });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
    };

    post.comments.unshift(newComment);

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username")
      .populate("comments.user", "username");

    res.status(201).json({
      message: "Comentario añadido exitosamente",
      post: updatedPost,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "ID de publicación inválido para comentar." });
    }
    console.error("Error al añadir comentario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al añadir el comentario." });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "No autorizado para eliminar esta publicación." });
    }

    await Post.deleteOne({ _id: postId });

    res.status(200).json({ message: "Publicación eliminada exitosamente." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de publicación inválido." });
    }
    console.error("Error al eliminar la publicación:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la publicación." });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({
          message: "El contenido de la publicación no puede estar vacío.",
        });
    }
    if (content.length > 280) {
      return res
        .status(400)
        .json({
          message:
            "El contenido de la publicación no puede exceder los 280 caracteres.",
        });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "No autorizado para editar esta publicación." });
    }

    post.content = content.trim();

    await post.save();

    const populatedPost = await post.populate("user", "username");

    res.status(200).json({
      message: "Publicación editada exitosamente",
      post: populatedPost,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID de publicación inválido." });
    }
    console.error("Error al editar la publicación:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al editar la publicación." });
  }
});

module.exports = router;
