// Supported file extensions for this parser: ZIP and TXT
const supportedExtensions = ['zip', 'txt'];

// Функция, возвращающая текст для drop-area, специфичный для WhatsApp
window.getWhatsappDropText = function() {
  const currentLang = document.querySelector('input[name="language"]:checked')?.value || "en";
  if (typeof translations !== "undefined" && translations[currentLang] && translations[currentLang].whatsappDropText) {
    return translations[currentLang].whatsappDropText;
  }
  if (currentLang === "ru") return "Перетащите ZIP или TXT файл сюда или нажмите для выбора";
  if (currentLang === "ua") return "Перетягніть ZIP або TXT файл сюди або натисніть для вибору";
  return "Drag and drop a ZIP or TXT file here or click to select";
};

document.addEventListener("DOMContentLoaded", function () {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const outputDiv = document.getElementById("output");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const languageRadios = document.querySelectorAll('input[name="language"]');
  const searchWordInput = document.getElementById("search-word");
  const searchInsideCheck = document.getElementById("search-inside");
  const showAuthorCheck = document.getElementById("show-author");
  const searchLabel = document.getElementById("search-label");
  const progressOverlay = document.getElementById("progress-overlay");
  const progressBarInner = document.getElementById("progress-bar-inner");
  const cancelBtn = document.getElementById("cancel-btn");
  const dateRangeCheckbox = document.getElementById("date-range-checkbox");
  const dateRangeFields = document.getElementById("date-range-fields");
  let filteredText = "";
  let generatedFileName = "whatsapp.txt";
  let cachedFileContent = null;
  let selectedFileName = "";
  let currentFileReader = null;
  let isCanceled = false;
  
  // Локализации для WhatsApp
  const translations = {
    en: {
      title: "WhatsApp Chat Parser",
      description: "Sample text",
      searchLabelBegin: "Enter a search word at the beginning of each message:",
      searchLabelAnywhere: "Enter a search string anywhere in each message:",
      dropText: "Drag and drop a ZIP or TXT file here or click to select",
      fileSelected: "File selected: ",
      copyBtn: "Copy",
      downloadBtn: "Download result",
      noMessages: "No messages found with the given word.",
      cancel: "Cancel",
      searchInsideLabel: "Search string inside messages",
      showAuthorLabel: "Show message author",
      authorLabel: "Author: ",
      dateRangeLabel: "Date range",
      dateFromPlaceholder: "From",
      dateToPlaceholder: "To",
      whatsappDropText: "Drag and drop a ZIP or TXT file here or click to select"
    },
    ru: {
      title: "Парсер WhatsApp Чата",
      description: "Sample text",
      searchLabelBegin: "Введите слово для поиска в начале каждого сообщения:",
      searchLabelAnywhere: "Введите строку для поиска в любом месте каждого сообщения:",
      dropText: "Перетащите ZIP или TXT файл сюда или нажмите для выбора",
      fileSelected: "Файл выбран: ",
      copyBtn: "Копировать",
      downloadBtn: "Скачать результат",
      noMessages: "Сообщений с заданным словом не найдено.",
      cancel: "Отмена",
      searchInsideLabel: "Искать строку внутри сообщений",
      showAuthorLabel: "Показывать автора сообщения",
      authorLabel: "Автор: ",
      dateRangeLabel: "Диапазон дат",
      dateFromPlaceholder: "От",
      dateToPlaceholder: "До",
      whatsappDropText: "Перетащите ZIP или TXT файл сюда или нажмите для выбора"
    },
    ua: {
      title: "Парсер WhatsApp чату",
      description: "Sample text",
      searchLabelBegin: "Введіть слово для пошуку на початку кожного повідомлення:",
      searchLabelAnywhere: "Введіть рядок для пошуку у будь-якому місці кожного повідомлення:",
      dropText: "Перетягніть ZIP або TXT файл сюди або натисніть для вибору",
      fileSelected: "Файл обрано: ",
      copyBtn: "Скопіювати",
      downloadBtn: "Завантажити результат",
      noMessages: "Повідомлень із заданим словом не знайдено.",
      cancel: "Скасувати",
      searchInsideLabel: "Шукати рядок усередині повідомлень",
      showAuthorLabel: "Показувати автора повідомлення",
      authorLabel: "Автор: ",
      dateRangeLabel: "Діапазон дат",
      dateFromPlaceholder: "Від",
      dateToPlaceholder: "До",
      whatsappDropText: "Перетягніть ZIP або TXT файл сюди або натисніть для вибору"
    }
  };
  
  // Оставляем parseDate (может понадобиться для диапазона дат)
  function parseDate(dateStr) {
    const regex = /^(\d{2})[\/.](\d{2})[\/.](\d{4})(.*)$/;
    if (regex.test(dateStr)) {
      return new Date(dateStr.replace(regex, "$3-$2-$1$4"));
    }
    return new Date(dateStr);
  }
  
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }
  
  function updateSearchLabel() {
    const currentLang = document.querySelector('input[name="language"]:checked').value;
    if (searchInsideCheck.checked) {
      searchLabel.textContent = translations[currentLang].searchLabelAnywhere;
    } else {
      searchLabel.textContent = translations[currentLang].searchLabelBegin;
    }
  }
  
  function updateLanguage(lang) {
    document.getElementById("title").textContent = translations[lang].title;
    document.getElementById("description").textContent = translations[lang].description;
    copyBtn.textContent = translations[lang].copyBtn;
    downloadBtn.textContent = translations[lang].downloadBtn;
    cancelBtn.textContent = translations[lang].cancel;
    document.getElementById("search-inside-label").textContent = translations[lang].searchInsideLabel;
    document.getElementById("show-author-label").textContent = translations[lang].showAuthorLabel;
    document.getElementById("date-range-label").textContent = translations[lang].dateRangeLabel;
    document.getElementById("date-from").placeholder = translations[lang].dateFromPlaceholder;
    document.getElementById("date-to").placeholder = translations[lang].dateToPlaceholder;
    if (selectedFileName) {
      dropText.textContent = translations[lang].fileSelected + selectedFileName;
    } else {
      dropText.textContent = translations[lang].dropText;
    }
    updateSearchLabel();
    localStorage.setItem("language", lang);
  }
  
  languageRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateLanguage(radio.value);
    });
  });
  
  if (localStorage.getItem("language")) {
    const savedLang = localStorage.getItem("language");
    updateLanguage(savedLang);
    document.querySelector(`input[name="language"][value="${savedLang}"]`).checked = true;
  }
  
  searchInsideCheck.addEventListener("change", function () {
    updateSearchLabel();
  });
  
  searchWordInput.addEventListener("input", function () {
    // Логика обработки поиска добавится позже
  });
  
  showAuthorCheck.addEventListener("change", function () {
    // Логика обработки отображения автора добавится позже
  });
  
  dateRangeCheckbox.addEventListener("change", function () {
    if (dateRangeCheckbox.checked) {
      dateRangeFields.style.display = "block";
    } else {
      dateRangeFields.style.display = "none";
    }
  });
  
  document.getElementById("date-from").addEventListener("change", function () {
    // Логика диапазона дат добавится позже
  });
  
  document.getElementById("date-to").addEventListener("change", function () {
    // Логика диапазона дат добавится позже
  });
  
  function handleFile(file) {
    selectedFileName = file.name;
    isCanceled = false;
    currentFileReader = new FileReader();
    currentFileReader.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBarInner.style.width = percent + "%";
      }
    };
    currentFileReader.onloadstart = function () {
      progressBarInner.style.width = "0%";
      progressOverlay.style.display = "flex";
    };
    currentFileReader.onload = function (e) {
      if (isCanceled) return;
      let content = e.target.result.trim();
      // Здесь для WhatsApp мы пока не реализуем логику парсинга сообщений
      cachedFileContent = content;
      processWhatsApp(content);
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      dropText.textContent = translations[currentLang].fileSelected + file.name;
      const isLight = document.body.classList.contains("light-theme");
      dropArea.style.backgroundColor = isLight ? "var(--light-drop-selected)" : "var(--dark-drop-bg)";
      progressOverlay.style.display = "none";
    };
    currentFileReader.onerror = function () {
      progressOverlay.style.display = "none";
    };
    currentFileReader.onabort = function () {
      progressOverlay.style.display = "none";
    };
    currentFileReader.readAsText(file);
  }
  
  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });
  
  dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropArea.style.backgroundColor = "#555";
  });
  
  dropArea.addEventListener("dragleave", function () {
    const isLight = document.body.classList.contains("light-theme");
    dropArea.style.backgroundColor = isLight ? "var(--light-drop-bg)" : "var(--dark-drop-bg)";
  });
  
  dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    const isLight = document.body.classList.contains("light-theme");
    dropArea.style.backgroundColor = isLight ? "var(--light-drop-bg)" : "var(--dark-drop-bg)";
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      handleFile(file);
    }
  });
  
  dropArea.addEventListener("click", function () {
    fileInput.click();
  });
  
  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(filteredText).then(() => {
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      copyBtn.textContent = currentLang === "en" ? "Copied" : (currentLang === "ru" ? "Скопировано" : "Скопійовано");
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = translations[currentLang].copyBtn;
        copyBtn.style.backgroundColor = "";
        copyBtn.disabled = false;
      }, 3000);
    });
  });
  
  downloadBtn.addEventListener("click", function () {
    const blob = new Blob([filteredText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = generatedFileName;
    link.click();
  });
  
  themeToggleBtn.addEventListener("click", function () {
    if (document.body.classList.contains("light-theme")) {
      document.body.classList.remove("light-theme");
      themeToggleBtn.textContent = "Light mode";
    } else {
      document.body.classList.add("light-theme");
      themeToggleBtn.textContent = "Dark mode";
    }
    if (cachedFileContent) {
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      if (selectedFileName) {
        dropText.textContent = translations[currentLang].fileSelected + selectedFileName;
      }
      const isLight = document.body.classList.contains("light-theme");
      dropArea.style.backgroundColor = isLight ? "var(--light-drop-selected)" : "var(--dark-drop-bg)";
    }
  });
  
  cancelBtn.addEventListener("click", function () {
    if (currentFileReader) {
      isCanceled = true;
      currentFileReader.abort();
    }
    progressOverlay.style.display = "none";
  });
  
  dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropArea.style.backgroundColor = "#555";
  });
  
  dropArea.addEventListener("dragleave", function () {
    const isLight = document.body.classList.contains("light-theme");
    dropArea.style.backgroundColor = isLight ? "var(--light-drop-bg)" : "var(--dark-drop-bg)";
  });
  
  dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    const isLight = document.body.classList.contains("light-theme");
    dropArea.style.backgroundColor = isLight ? "var(--light-drop-bg)" : "var(--dark-drop-bg)";
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      handleFile(file);
    }
  });
  
  dropArea.addEventListener("click", function () {
    fileInput.click();
  });
  
  function processWhatsApp(content) {
    // Пока логика обработки WhatsApp сообщений отсутствует
    outputDiv.textContent = "WhatsApp message processing not implemented yet.";
    outputDiv.style.display = "block";
  }
});
