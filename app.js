const state = {
  articles: [],
  ebooks: [],
};

const emptyMessage = (message) => `<div class="empty-state">${message}</div>`;

const selectors = {
  articleGrid: document.getElementById("articleGrid"),
  ebookGrid: document.getElementById("ebookGrid"),
  searchInput: document.getElementById("searchInput"),
  articleCount: document.getElementById("articleCount"),
  ebookCount: document.getElementById("ebookCount"),
  modal: document.getElementById("articleModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalAuthor: document.getElementById("modalAuthor"),
  modalAbstract: document.getElementById("modalAbstract"),
};

const isHomePage = Boolean(selectors.articleGrid && selectors.ebookGrid);

const isValidArticle = (article) =>
  Boolean(article && article.title && article.author && article.abstract);

const isValidEbook = (ebook) =>
  Boolean(
    ebook &&
      ebook.title &&
      ebook.author &&
      (ebook.downloadUrl || ebook.readUrl || ebook.coverUrl)
  );

const setCounts = () => {
  if (!selectors.articleCount || !selectors.ebookCount) return;
  selectors.articleCount.textContent = state.articles.length.toString();
  selectors.ebookCount.textContent = state.ebooks.length.toString();
};

const createArticleCard = (article) => {
  const card = document.createElement("article");
  card.className = "article-card";
  card.innerHTML = `
    <div>
      <h3>${article.title}</h3>
      <p class="meta">${article.author} · ${article.subject || "General"}</p>
      <p class="abstract">${article.abstract}</p>
    </div>
    <button type="button" data-id="${article.id}">Read</button>
  `;
  const button = card.querySelector("button");
  button.addEventListener("click", () => openModal(article));
  return card;
};

const createEbookCard = (ebook) => {
  const card = document.createElement("div");
  card.className = "ebook-card";
  const cover = ebook.coverUrl
    ? `<img src="${ebook.coverUrl}" alt="${ebook.title} cover" />`
    : `<span>${ebook.title.split(" ")[0]}</span>`;
  card.innerHTML = `
    <div class="ebook-cover">${cover}</div>
    <div class="ebook-info">
      <h3>${ebook.title}</h3>
      <p class="meta">${ebook.author}</p>
      <div class="ebook-actions">
        <button type="button" data-action="download">Download</button>
        <button type="button" class="secondary" data-action="read">Read Online</button>
      </div>
    </div>
  `;
  const downloadButton = card.querySelector('[data-action="download"]');
  const readButton = card.querySelector('[data-action="read"]');
  downloadButton.addEventListener("click", () => handleDownload(ebook));
  readButton.addEventListener("click", () => handleReadOnline(ebook));
  return card;
};

const renderCards = (articles, ebooks) => {
  if (!selectors.articleGrid || !selectors.ebookGrid) return;
  selectors.articleGrid.innerHTML = "";
  selectors.ebookGrid.innerHTML = "";

  if (articles.length === 0) {
    selectors.articleGrid.innerHTML = emptyMessage(
      "No articles available yet. Connect your backend to load published research."
    );
  } else {
    articles.forEach((article) => selectors.articleGrid.appendChild(createArticleCard(article)));
  }

  if (ebooks.length === 0) {
    selectors.ebookGrid.innerHTML = emptyMessage(
      "No ebooks available yet. Published ebooks will appear here once connected."
    );
  } else {
    ebooks.forEach((ebook) => selectors.ebookGrid.appendChild(createEbookCard(ebook)));
  }
};

const applySearchFilter = () => {
  if (!selectors.searchInput) return;
  const query = selectors.searchInput.value.toLowerCase();
  const filteredArticles = state.articles.filter((article) => {
    return [article.title, article.author, article.subject, article.abstract]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const filteredEbooks = state.ebooks.filter((ebook) => {
    return [ebook.title, ebook.author]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  renderCards(filteredArticles, filteredEbooks);
};

const openModal = (article) => {
  if (!selectors.modal) return;
  selectors.modalTitle.textContent = article.title;
  selectors.modalAuthor.textContent = `${article.author} · ${article.subject || "General"}`;
  selectors.modalAbstract.textContent = article.abstract;
  selectors.modal.classList.add("active");
  selectors.modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  if (!selectors.modal) return;
  selectors.modal.classList.remove("active");
  selectors.modal.setAttribute("aria-hidden", "true");
};

const handleDownload = (ebook) => {
  if (ebook.downloadUrl) {
    const link = document.createElement("a");
    link.href = ebook.downloadUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.alert("Download link will be available once the backend is connected.");
  }
};

const handleReadOnline = (ebook) => {
  if (ebook.readUrl) {
    window.open(ebook.readUrl, "_blank");
  } else {
    window.alert("Read Online will open once the backend supplies a PDF URL.");
  }
};

const fetchContent = async () => {
  try {
    const [articlesResponse, ebooksResponse] = await Promise.all([
      fetch("/api/articles"),
      fetch("/api/ebooks"),
    ]);
    const articles = articlesResponse.ok ? await articlesResponse.json() : [];
    const ebooks = ebooksResponse.ok ? await ebooksResponse.json() : [];
    state.articles = Array.isArray(articles) ? articles.filter(isValidArticle) : [];
    state.ebooks = Array.isArray(ebooks) ? ebooks.filter(isValidEbook) : [];
  } catch (error) {
    state.articles = [];
    state.ebooks = [];
  }

  setCounts();
  renderCards(state.articles, state.ebooks);
};

const bindHomeEvents = () => {
  if (selectors.searchInput) {
    selectors.searchInput.addEventListener("input", applySearchFilter);
  }

  const modalClose = selectors.modal?.querySelector(".modal-close");
  modalClose?.addEventListener("click", closeModal);
  selectors.modal?.addEventListener("click", (event) => {
    if (event.target === selectors.modal) closeModal();
  });

  document.querySelectorAll("[data-action='scroll-articles']").forEach((button) => {
    button.addEventListener("click", () => document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" }));
  });
  document.querySelectorAll("[data-action='scroll-ebooks']").forEach((button) => {
    button.addEventListener("click", () => document.getElementById("ebooks")?.scrollIntoView({ behavior: "smooth" }));
  });
  document.querySelectorAll("[data-action='open-upload']").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "upload.html";
    });
  });
};

const initEditorPage = () => {
  const editorElement = document.getElementById("editor");
  if (!editorElement || typeof Quill === "undefined") return;

  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Compose your article...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "blockquote"],
        ["clean"],
      ],
    },
  });

  const form = document.getElementById("articleForm");
  const status = document.getElementById("articleStatus");
  const publishButton = document.querySelector("[data-action='publish']");

  const submitArticle = async () => {
    if (!form) return;
    status.textContent = "Publishing...";
    const formData = new FormData(form);
    const payload = {
      title: formData.get("title"),
      author: formData.get("author"),
      subject: formData.get("subject"),
      abstract: formData.get("abstract"),
      content: quill.root.innerHTML,
    };

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      status.textContent = response.ok
        ? "Article published successfully!"
        : "Publishing failed. Please try again.";
      if (response.ok) form.reset();
    } catch (error) {
      status.textContent = "Network error. Please try again.";
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitArticle();
  });
  publishButton?.addEventListener("click", submitArticle);
};

const initUploadPage = () => {
  const coverInput = document.getElementById("coverInput");
  const ebookInput = document.getElementById("ebookInput");
  const preview = document.getElementById("coverPreview");
  const form = document.getElementById("ebookForm");
  const status = document.getElementById("ebookStatus");
  const maxCoverSize = 5 * 1024 * 1024;
  const maxEbookSize = 20 * 1024 * 1024;

  const showStatus = (message) => {
    if (status) status.textContent = message;
  };

  coverInput?.addEventListener("change", () => {
    const file = coverInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showStatus("Cover image must be a PNG or JPEG.");
      coverInput.value = "";
      preview?.classList.remove("visible");
      return;
    }
    if (file.size > maxCoverSize) {
      showStatus("Cover image exceeds 5MB.");
      coverInput.value = "";
      preview?.classList.remove("visible");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (preview) {
        preview.src = reader.result;
        preview.classList.add("visible");
      }
    };
    reader.readAsDataURL(file);
    showStatus("Cover image ready.");
  });

  ebookInput?.addEventListener("change", () => {
    const file = ebookInput.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/epub+zip"];
    if (!allowedTypes.includes(file.type)) {
      showStatus("Ebook must be a PDF or EPUB file.");
      ebookInput.value = "";
      return;
    }
    if (file.size > maxEbookSize) {
      showStatus("Ebook exceeds 20MB.");
      ebookInput.value = "";
      return;
    }
    showStatus("Ebook file ready.");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!coverInput?.files?.[0] || !ebookInput?.files?.[0]) {
      showStatus("Please add both a cover image and ebook file.");
      return;
    }

    const payload = new FormData(form);
    showStatus("Uploading...");
    try {
      const response = await fetch("/api/ebooks", {
        method: "POST",
        body: payload,
      });
      showStatus(response.ok ? "Ebook uploaded successfully!" : "Upload failed. Please try again.");
      if (response.ok) form.reset();
    } catch (error) {
      showStatus("Network error. Please try again.");
    }
  });
};

if (isHomePage) {
  fetchContent();
  bindHomeEvents();
}

initEditorPage();
initUploadPage();
