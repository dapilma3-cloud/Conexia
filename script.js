const uploadButton = document.querySelector(".upload-form button");
const uploadInputs = document.querySelectorAll(".upload-form input");

const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2400);
};

uploadButton?.addEventListener("click", () => {
  const [fileInput, titleInput, authorInput] = uploadInputs;
  if (!fileInput?.files?.length || !titleInput.value || !authorInput.value) {
    showToast("Please add the eBook file, title, and author.");
    return;
  }

  showToast("Upload queued! Our team will review your eBook.");
  uploadInputs.forEach((input) => {
    if (input.type === "file") {
      input.value = "";
    } else {
      input.value = "";
    }
  });
});
