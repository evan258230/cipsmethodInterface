document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browseBtn");
  const fileInput = document.getElementById("fileInput");
  const fileDisplay = document.getElementById("fileDisplay");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const deleteFile = document.getElementById("deleteFile");

  if (browseBtn && fileInput) {

    browseBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        fileInput.value = "";
        return;
      }

      const sizeKB = (file.size / 1024).toFixed(1);
      fileName.textContent = file.name;
      fileSize.textContent = `${sizeKB} KB`;
      fileDisplay.style.display = "block";
    });
  }

  if (deleteFile) {
    deleteFile.addEventListener("click", () => {
      fileDisplay.style.display = "none";
      fileInput.value = "";
    });
  }
});
