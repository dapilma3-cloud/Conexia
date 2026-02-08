const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5500;
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadDir));

const articles = [];
const ebooks = [];

app.get("/api/articles", (req, res) => {
  res.json(articles);
});

app.post("/api/articles", (req, res) => {
  const { title, author, subject, abstract, content } = req.body;
  if (!title || !author || !subject || !abstract || !content) {
    return res.status(400).json({ message: "Missing required article fields." });
  }

  const article = {
    id: articles.length + 1,
    title,
    author,
    subject,
    abstract,
    content,
  };

  articles.unshift(article);
  return res.status(201).json(article);
});

app.get("/api/ebooks", (req, res) => {
  res.json(ebooks);
});

app.post(
  "/api/ebooks",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "ebook", maxCount: 1 },
  ]),
  (req, res) => {
    const { title, author, category, description, isbn } = req.body;
    const coverFile = req.files?.cover?.[0];
    const ebookFile = req.files?.ebook?.[0];

    if (!title || !author || !category || !description || !coverFile || !ebookFile) {
      return res.status(400).json({ message: "Missing required ebook fields." });
    }

    const coverUrl = `/uploads/${coverFile.filename}`;
    const ebookUrl = `/uploads/${ebookFile.filename}`;
    const isPdf = ebookFile.mimetype === "application/pdf";

    const ebook = {
      id: ebooks.length + 1,
      title,
      author,
      category,
      description,
      isbn: isbn || "",
      coverUrl,
      downloadUrl: ebookUrl,
      readUrl: isPdf ? ebookUrl : "",
    };

    ebooks.unshift(ebook);
    return res.status(201).json(ebook);
  }
);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`ScienceHub backend running on http://127.0.0.1:${PORT}`);
});
