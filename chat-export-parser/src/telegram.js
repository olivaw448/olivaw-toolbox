(function initTelegramModule() {
  // Global defaults
  window.currentLanguage = window.currentLanguage || "en";
  window.currentExportType = window.currentExportType || "telegram";
  
  // Activate only if export type is telegram
  if (currentExportType !== "telegram") return;
  if (window.telegramModuleInitialized) return;
  window.telegramModuleInitialized = true;
  console.log("telegram module initialized, currentExportType:", currentExportType);

  function initTelegram() {
    // Module variables
    let cachedTelegramData = null;
    let selectedFileName = "";
    let currentFileReader = null;
    let isCanceled = false;
    let filteredText = "";
    let generatedFileName = "notes.txt";

    console.log("Telegram: initTelegram: data reset");

    // Clear search field on load
    const searchWordInput = document.getElementById("search-word");
    if (searchWordInput) {
      searchWordInput.value = "";
      searchWordInput.setAttribute("value", "");
      console.log("Telegram: search field cleared");
    }

    const supportedExtensions = ['json', 'html'];

    // Utility function to remove BOM
    function removeBOM(str) {
      return str.replace(/^\uFEFF/, '');
    }

    // Utility function to parse date from Telegram export
    function parseDate(dateStr) {
      const regex = /^(\d{2})[\/.](\d{2})[\/.](\d{4})(.*)$/;
      return regex.test(dateStr)
        ? new Date(dateStr.replace(regex, "$3-$2-$1$4"))
        : new Date(dateStr);
    }

    // Utility function to extract filename from a path
    function extractFileName(path) {
      const parts = path.split("/");
      return "**" + parts[parts.length - 1] + "**";
    }

    // Get DOM elements
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const dropText = document.getElementById("drop-text");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const outputDiv = document.getElementById("output");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const searchInsideCheck = document.getElementById("search-inside");
    const showAuthorCheck = document.getElementById("show-author");
    const searchLabel = document.getElementById("search-label");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const cancelBtn = document.getElementById("cancel-btn");
    const dateRangeCheckbox = document.getElementById("date-range-checkbox");
    const dateRangeFields = document.getElementById("date-range-fields");

    // Translations for Telegram module
    const translations = {
      en: {
        title: "Telegram Chat Parser",
        description: "Sample text",
        searchLabelBegin: "Enter a search word at the beginning of each message:",
        searchLabelAnywhere: "Enter a search string anywhere in each message:",
        dropText: "Drag and drop a JSON or HTML file here or click to select",
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
        dateToPlaceholder: "To"
      },
      ru: {
        title: "Парсер Telegram Чата",
        description: "Sample text",
        searchLabelBegin: "Введите слово для поиска вначале каждого сообщения:",
        searchLabelAnywhere: "Введите строку для поиска в любом месте каждого сообщения:",
        dropText: "Перетащите JSON или HTML файл сюда или нажмите для выбора",
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
        dateToPlaceholder: "До"
      },
      ua: {
        title: "Парсер Telegram Чату",
        description: "Sample text",
        searchLabelBegin: "Введіть слово для пошуку на початку кожного повідомлення:",
        searchLabelAnywhere: "Введіть рядок для пошуку в будь-якому місці кожного повідомлення:",
        dropText: "Перетягніть JSON або HTML файл сюди або натисніть для вибору",
        fileSelected: "Файл обрано: ",
        copyBtn: "Скопіювати",
        downloadBtn: "Завантажити результат",
        noMessages: "Повідомлень із заданним словом не знайдено.",
        cancel: "Скасувати",
        searchInsideLabel: "Шукати рядок всередині повідомлень",
        showAuthorLabel: "Показувати автора повідомлення",
        authorLabel: "Автор: ",
        dateRangeLabel: "Диапазон дат",
        dateFromPlaceholder: "Від",
        dateToPlaceholder: "До"
      }
    };

    // updateInterface uses selectedFileName instead of fileInput.value
    function updateInterface() {
      if (selectedFileName === "") {
        dropText.textContent = translations[currentLanguage].dropText;
      } else {
        dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
      }
      document.getElementById("date-from").placeholder = translations[currentLanguage].dateFromPlaceholder;
      document.getElementById("date-to").placeholder = translations[currentLanguage].dateToPlaceholder;
      document.getElementById("date-range-label").textContent = translations[currentLanguage].dateRangeLabel;
      searchLabel.textContent = searchInsideCheck.checked
        ? translations[currentLanguage].searchLabelAnywhere
        : translations[currentLanguage].searchLabelBegin;
    }
    updateInterface();

    // Expose updateInterface and getTelegramDropText globally
    window.updateInterface = updateInterface;
    window.getTelegramDropText = function() {
      return selectedFileName === "" ? translations[currentLanguage].dropText : translations[currentLanguage].fileSelected + selectedFileName;
    };

    function formatDateForFile(date) {
      return date.toLocaleDateString("ru-RU", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\./g, "-");
    }

    // Refresh parsed results if file is already loaded
    function refreshParsedResults() {
      if (currentExportType !== "telegram") return;
      if (!cachedTelegramData) return;
      if (typeof cachedTelegramData === "string") {
        const trimmed = cachedTelegramData.trim();
        if (trimmed.toLowerCase().startsWith("<!doctype") || trimmed.toLowerCase().startsWith("<html")) {
          processHTML(cachedTelegramData);
        } else {
          try {
            const jsonData = JSON.parse(removeBOM(cachedTelegramData));
            processJSON(jsonData);
          } catch (e) {
            outputDiv.textContent = "Error: Invalid JSON format!";
            outputDiv.style.display = "block";
          }
        }
      } else {
        processJSON(cachedTelegramData);
      }
    }

    function processJSON(jsonData) {
      console.log("Telegram processJSON called");
      const messagesArray = jsonData.messages || [];
      const currentLang = currentLanguage;
      const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = searchInsideCheck.checked;
      const showAuthor = showAuthorCheck.checked;

      let fromDate = null, toDate = null;
      if (dateRangeCheckbox.checked) {
        const dateFromVal = document.getElementById("date-from").value;
        const dateToVal = document.getElementById("date-to").value;
        fromDate = dateFromVal ? new Date(dateFromVal) : null;
        toDate = dateToVal ? new Date(dateToVal) : null;
        if (toDate) { toDate.setHours(23, 59, 59, 999); }
      }

      const results = [];
      const dates = [];
      messagesArray.forEach(msg => {
        let messageText = "";
        if (typeof msg.text === "string") {
          messageText = msg.text;
        } else if (Array.isArray(msg.text)) {
          messageText = msg.text.map(part => (typeof part === "string" ? part : part.text)).join("");
        }
        let includeMsg = true;
        if (searchWord.length > 0) {
          const lowerMsg = messageText.toLowerCase();
          includeMsg = searchInside ? lowerMsg.includes(searchWord) : lowerMsg.startsWith(searchWord);
        }
        if (!includeMsg) return;

        let dateObj = null;
        if (msg.date) {
          dateObj = parseDate(msg.date);
        } else if (msg.date_unixtime) {
          dateObj = new Date(msg.date_unixtime * 1000);
        }
        if (dateRangeCheckbox.checked && dateObj) {
          if (fromDate && dateObj < fromDate) return;
          if (toDate && dateObj > toDate) return;
        }

        let authorLine = "";
        if (showAuthor) {
          const author = msg.from || msg.from_name || "";
          if (author) {
            authorLine = "\n" + translations[currentLang].authorLabel + author;
          }
        }

        let attachments = [];
        if (msg.photo) attachments.push(extractFileName(msg.photo));
        if (msg.file) attachments.push(extractFileName(msg.file));
        const attachmentsStr = attachments.length ? "\n\n" + attachments.join("\n") : "";

        if (dateObj) {
          const formattedDate = dateObj.toLocaleString(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: currentLang === "en"
          }).replace(",", "");
          const dayOfWeek = dateObj.toLocaleDateString(locale, { weekday: "long" });
          results.push(`${formattedDate} (${dayOfWeek})${authorLine}\n\n${messageText}${attachmentsStr}\n\n-----------------------------------\n\n`);
          dates.push(dateObj);
        } else {
          results.push(`${messageText}${authorLine}${attachmentsStr}\n\n-----------------------------------\n\n`);
        }
      });

      if (results.length === 0) {
        outputDiv.textContent = translations[currentLang].noMessages;
        outputDiv.style.display = "block";
        copyBtn.style.display = "none";
        downloadBtn.style.display = "none";
        return;
      }

      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        const firstDate = formatDateForFile(dates[0]);
        const lastDate = formatDateForFile(dates[dates.length - 1]);
        generatedFileName = `notes-${firstDate}-to-${lastDate}.txt`;
      } else {
        generatedFileName = "notes.txt";
      }

      const plainTextResult = results.join("");
      const finalResult = plainTextResult.trimEnd();
      filteredText = finalResult;
      outputDiv.textContent = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      console.log("Telegram final JSON result:", finalResult);
    }

    function processHTML(htmlContent) {
      console.log("Telegram processHTML called");
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const messagesNodes = doc.querySelectorAll(".message");
      const results = [];
      const dates = [];
      const currentLang = currentLanguage;
      const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = searchInsideCheck.checked;
      const showAuthor = showAuthorCheck.checked;

      messagesNodes.forEach(msg => {
        if (msg.classList.contains("service")) return;
        let textForSearch = "";
        const textElem = msg.querySelector(".text");
        if (textElem) {
          let htmlText = textElem.innerHTML.replace(/<br\s*\/?>/gi, "\n");
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = htmlText;
          textForSearch = tempDiv.textContent.trim();
        }
        let mediaInfo = "";
        const photoLink = msg.querySelector("a.media_photo");
        if (photoLink) mediaInfo += extractFileName(photoLink.getAttribute("href"));
        const videoLink = msg.querySelector("a.video_file_wrap") || msg.querySelector("a.media_video");
        if (videoLink) mediaInfo += extractFileName(videoLink.getAttribute("href"));
        const fileLink = msg.querySelector("a.media_file");
        if (fileLink) mediaInfo += extractFileName(fileLink.getAttribute("href"));
        const voiceLink = msg.querySelector("a.media_voice_message");
        if (voiceLink) mediaInfo += extractFileName(voiceLink.getAttribute("href"));
        let includeMsg = true;
        if (searchWord.length > 0) {
          const lowerText = textForSearch.toLowerCase();
          includeMsg = searchInside ? lowerText.includes(searchWord) : lowerText.startsWith(searchWord);
        }
        if (!includeMsg) return;

        let dateStr = "";
        let dateObj = null;
        const dateElem = msg.querySelector(".pull_right.date.details");
        if (dateElem) {
          let titleAttr = dateElem.getAttribute("title");
          if (titleAttr) {
            if (titleAttr.indexOf(".") !== -1) {
              titleAttr = titleAttr.replace(/^(\d{2})\.(\d{2})\.(\d{4})(.*)$/, "$3-$2-$1$4");
            }
            dateObj = new Date(titleAttr);
          } else {
            dateObj = new Date(dateElem.textContent.trim());
          }
          if (dateObj && !isNaN(dateObj.getTime())) {
            if (dateRangeCheckbox.checked) {
              const dateFromVal = document.getElementById("date-from").value;
              const dateToVal = document.getElementById("date-to").value;
              let fromDate = dateFromVal ? new Date(dateFromVal) : null;
              let toDate = dateToVal ? new Date(dateToVal) : null;
              if (toDate) toDate.setHours(23,59,59,999);
              if (fromDate && dateObj < fromDate) return;
              if (toDate && dateObj > toDate) return;
            }
            dateStr = dateObj.toLocaleString(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: currentLang === "en"
            }).replace(",", "");
            const dayOfWeek = dateObj.toLocaleDateString(locale, { weekday: "long" });
            dateStr += " (" + dayOfWeek + ")";
            dates.push(dateObj);
          }
        }
        let authorLine = "";
        if (showAuthor) {
          let authorText = "";
          let authorElem = msg.querySelector(".from_name");
          if (authorElem) authorText = authorElem.textContent.trim();
          if (!authorText) {
            const initialsElem = msg.querySelector(".userpic .initials");
            if (initialsElem) authorText = initialsElem.textContent.trim();
          }
          if (authorText) authorLine = "\n" + translations[currentLang].authorLabel + authorText;
        }
        let finalMsg = dateStr ? `${dateStr}${authorLine}\n\n${textForSearch}` : `${textForSearch}${authorLine}`;
        if (mediaInfo) finalMsg += `\n\n${mediaInfo}`;
        results.push(finalMsg + "\n\n-----------------------------------\n\n");
      });

      if (results.length === 0) {
        outputDiv.textContent = translations[currentLang].noMessages;
        outputDiv.style.display = "block";
        copyBtn.style.display = "none";
        downloadBtn.style.display = "none";
        return;
      }

      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        const firstDate = formatDateForFile(dates[0]);
        const lastDate = formatDateForFile(dates[dates.length - 1]);
        generatedFileName = `notes-${firstDate}-to-${lastDate}.txt`;
      } else {
        generatedFileName = "notes.txt";
      }

      const plainTextResult = results.join("");
      const finalResult = plainTextResult.trimEnd();
      filteredText = finalResult;
      outputDiv.textContent = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      console.log("Telegram final HTML result:", finalResult);
    }

    function handleFile(file) {
      console.log("Telegram: handleFile called for file:", file.name);
      selectedFileName = file.name;
      isCanceled = false;
      currentFileReader = new FileReader();
      currentFileReader.onloadstart = function () {
        progressBarInner.style.width = "0%";
        progressOverlay.style.display = "flex";
        console.log("Telegram: File reading started for:", file.name);
      };
      currentFileReader.onload = function (e) {
        if (isCanceled) return;
        let content = e.target.result.trim();
        fileInput.value = "";
        console.log("Telegram: File read completed for:", file.name);
        if (content.toLowerCase().startsWith("<!doctype") ||
            content.toLowerCase().startsWith("<html")) {
          cachedTelegramData = content;
          processHTML(content);
        } else {
          try {
            const jsonData = JSON.parse(content);
            cachedTelegramData = jsonData;
            processJSON(jsonData);
            console.log("Telegram: JSON file parsed successfully");
          } catch (err) {
            outputDiv.textContent = "Error: Invalid JSON format!";
            outputDiv.style.display = "block";
            copyBtn.style.display = "none";
            downloadBtn.style.display = "none";
          }
        }
        const currentLang = currentLanguage;
        dropText.textContent = translations[currentLang].fileSelected + selectedFileName;
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
        progressOverlay.style.display = "none";
        console.log("Telegram: File processed:", selectedFileName);
      };
      currentFileReader.onerror = function () {
        progressOverlay.style.display = "none";
        console.log("Telegram: Error reading file");
      };
      currentFileReader.onabort = function () {
        progressOverlay.style.display = "none";
        console.log("Telegram: File reading aborted");
      };
      currentFileReader.readAsText(file);
    }

    fileInput.addEventListener("change", function () {
      console.log("Telegram: file-input event triggered");
      if (currentExportType !== "telegram") {
        console.log("Telegram: Ignoring fileInput change because currentExportType is not telegram");
        return;
      }
      if (fileInput.files && fileInput.files.length > 0) {
        selectedFileName = fileInput.files[0].name;
        console.log("Telegram: File input change, file:", selectedFileName);
        handleFile(fileInput.files[0]);
      }
    });

    dropArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropArea.style.backgroundColor = "#555";
    });
    dropArea.addEventListener("dragleave", function () {
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
    });
    dropArea.addEventListener("drop", function (e) {
      e.preventDefault();
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
      if (currentExportType !== "telegram") {
        console.log("Telegram: Ignoring drop event because currentExportType is not telegram");
        return;
      }
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        selectedFileName = file.name;
        console.log("Telegram: Drop event, file:", selectedFileName);
        handleFile(file);
      }
    });
    dropArea.addEventListener("click", function () {
      if (currentExportType !== "telegram") {
        console.log("Telegram: Ignoring dropArea click because currentExportType is not telegram");
        return;
      }
      fileInput.click();
    });

    // Filter event listeners
    searchWordInput.addEventListener("input", function () {
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
    searchInsideCheck.addEventListener("change", function () {
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
    showAuthorCheck.addEventListener("change", function () {
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
    dateRangeCheckbox.addEventListener("change", function () {
      dateRangeFields.style.display = dateRangeCheckbox.checked ? "block" : "none";
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
    document.getElementById("date-from").addEventListener("change", function () {
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
    document.getElementById("date-to").addEventListener("change", function () {
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });

    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(filteredText).then(() => {
        copyBtn.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--btn-light-pressed)"
          : "var(--btn-dark-pressed)";
        copyBtn.textContent = currentLanguage === "en" ? "Copied" : (currentLanguage === "ru" ? "Скопировано" : "Скопійовано");
        copyBtn.disabled = true;
        setTimeout(() => {
          copyBtn.textContent = translations[currentLanguage].copyBtn;
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
      if (cachedTelegramData && currentExportType === "telegram") {
        dropText.textContent = selectedFileName === ""
          ? translations[currentLanguage].dropText
          : translations[currentLanguage].fileSelected + selectedFileName;
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
      }
    });

    cancelBtn.addEventListener("click", function () {
      if (currentFileReader) {
        isCanceled = true;
        currentFileReader.abort();
        console.log("Telegram: File reading aborted");
      }
      progressOverlay.style.display = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTelegram);
  } else {
    initTelegram();
  }
})();
