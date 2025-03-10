(function initTelegramModule() {
  function initTelegram() {
    if (window.telegramModuleInitialized) return;
    window.telegramModuleInitialized = true;
    const supportedExtensions = ['json', 'html'];
    function parseDate(dateStr) {
      const regex = /^(\d{2})[\/.](\d{2})[\/.](\d{4})(.*)$/;
      return regex.test(dateStr)
        ? new Date(dateStr.replace(regex, "$3-$2-$1$4"))
        : new Date(dateStr);
    }
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
    let generatedFileName = "notes.txt";
    let cachedJsonData = null;
    let selectedFileName = "";
    let currentFileReader = null;
    let isCanceled = false;
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
        noMessages: "Повідомлень із заданим словом не знайдено.",
        cancel: "Скасувати",
        searchInsideLabel: "Шукати рядок всередині повідомлень",
        showAuthorLabel: "Показувати автора повідомлення",
        authorLabel: "Автор: ",
        dateRangeLabel: "Діапазон дат",
        dateFromPlaceholder: "Від",
        dateToPlaceholder: "До"
      }
    };
    function escapeHTML(str) {
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
    function extractFileName(path) {
      const parts = path.split("/");
      return "**" + parts[parts.length - 1] + "**";
    }
    function updateSearchLabel() {
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      searchLabel.textContent = searchInsideCheck.checked
        ? translations[currentLang].searchLabelAnywhere
        : translations[currentLang].searchLabelBegin;
    }
    window.getTelegramDropText = function() {
      const currentLang = document.querySelector('input[name="language"]:checked')?.value || "en";
      return translations[currentLang].dropText;
    };
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
      dropText.textContent = selectedFileName
        ? translations[lang].fileSelected + selectedFileName
        : translations[lang].dropText;
      updateSearchLabel();
      localStorage.setItem("language", lang);
      updateDropText();
    }
    languageRadios.forEach(radio => {
      radio.addEventListener("change", () => updateLanguage(radio.value));
    });
    if (localStorage.getItem("language")) {
      const savedLang = localStorage.getItem("language");
      updateLanguage(savedLang);
      document.querySelector(`input[name="language"][value="${savedLang}"]`).checked = true;
    } else {
      updateLanguage("en");
    }
    searchInsideCheck.addEventListener("change", updateSearchLabel);
    searchWordInput.addEventListener("input", function () {});
    showAuthorCheck.addEventListener("change", function () {});
    dateRangeCheckbox.addEventListener("change", function () {
      dateRangeFields.style.display = dateRangeCheckbox.checked ? "block" : "none";
    });
    document.getElementById("date-from").addEventListener("change", function () {});
    document.getElementById("date-to").addEventListener("change", function () {});
    function isHTMLFile(contentObj) {
      return contentObj.isHTML;
    }
    function handleFile(file) {
      selectedFileName = file.name;
      isCanceled = false;
      currentFileReader = new FileReader();
      currentFileReader.onprogress = function (e) {
        if (e.lengthComputable) {
          progressBarInner.style.width = Math.round((e.loaded / e.total) * 100) + "%";
        }
      };
      currentFileReader.onloadstart = function () {
        progressBarInner.style.width = "0%";
        progressOverlay.style.display = "flex";
      };
      currentFileReader.onload = function (e) {
        if (isCanceled) return;
        let content = e.target.result.trim();
        if (content.startsWith("<!DOCTYPE") || content.toLowerCase().startsWith("<html")) {
          cachedJsonData = { isHTML: true, rawContent: content };
          processHTML(content);
        } else {
          try {
            let jsonData = JSON.parse(content);
            cachedJsonData = jsonData;
            processJSON(jsonData);
          } catch (err) {
            outputDiv.textContent = "Error: Invalid JSON format!";
            outputDiv.style.display = "block";
            copyBtn.style.display = "none";
            downloadBtn.style.display = "none";
          }
        }
        const currentLang = document.querySelector('input[name="language"]:checked').value;
        dropText.textContent = translations[currentLang].fileSelected + file.name;
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
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
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
    });
    dropArea.addEventListener("drop", function (e) {
      e.preventDefault();
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        handleFile(file);
      }
    });
    function handleDropClick(e) {
      e.stopPropagation();
      fileInput.click();
    }
    // Remove any duplicate click handlers before adding one.
    dropArea.removeEventListener("click", handleDropClick);
    dropArea.addEventListener("click", handleDropClick);
    function processJSON(jsonData) {
      const messages = jsonData.messages || [];
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = searchInsideCheck.checked;
      const showAuthor = showAuthorCheck.checked;
      const results = [];
      const dates = [];
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
      messages.forEach(msg => {
        let messageText = "";
        if (typeof msg.text === "string") {
          messageText = msg.text;
        } else if (Array.isArray(msg.text)) {
          messageText = msg.text.map(part => (typeof part === "string" ? part : part.text)).join("");
        }
        let match = searchWord === "" ? true : false;
        if (!match) {
          const lowerMsg = messageText.toLowerCase();
          match = searchInside ? lowerMsg.includes(searchWord) : lowerMsg.startsWith(searchWord);
        }
        if (match) {
          let dateObj = null;
          if (msg.date) {
            dateObj = parseDate(msg.date);
          } else if (msg.date_unixtime) {
            dateObj = new Date(msg.date_unixtime * 1000);
          }
          if (dateRangeCheckbox.checked) {
            const dateFromVal = document.getElementById("date-from").value;
            const dateToVal = document.getElementById("date-to").value;
            let fromDate = dateFromVal ? new Date(dateFromVal) : null;
            let toDate = dateToVal ? new Date(dateToVal) : null;
            if (toDate) { toDate.setHours(23,59,59,999); }
            if (!dateObj) return;
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
          let attachmentsStr = attachments.length ? "\n\n" + attachments.join("\n") : "";
          if (dateObj) {
            const formattedDate = dateObj.toLocaleString(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }).replace(",", "");
            const dayOfWeek = dateObj.toLocaleDateString(locale, { weekday: "long" });
            results.push(`${formattedDate} (${dayOfWeek})${authorLine}\n\n${messageText}${attachmentsStr}\n\n-----------------------------------\n\n`);
            dates.push(dateObj);
          } else {
            results.push(`${messageText}${authorLine}${attachmentsStr}\n\n-----------------------------------\n\n`);
          }
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
      outputDiv.innerText = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      filteredText = finalResult;
    }
    function processHTML(htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const messages = doc.querySelectorAll(".message");
      const results = [];
      const dates = [];
      const currentLang = document.querySelector('input[name="language"]:checked').value;
      const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = searchInsideCheck.checked;
      const showAuthor = showAuthorCheck.checked;
      messages.forEach(msg => {
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
        if (photoLink) {
          mediaInfo += extractFileName(photoLink.getAttribute("href"));
        }
        const videoLink = msg.querySelector("a.video_file_wrap") || msg.querySelector("a.media_video");
        if (videoLink) {
          mediaInfo += extractFileName(videoLink.getAttribute("href"));
        }
        const fileLink = msg.querySelector("a.media_file");
        if (fileLink) {
          mediaInfo += extractFileName(fileLink.getAttribute("href"));
        }
        const voiceLink = msg.querySelector("a.media_voice_message");
        if (voiceLink) {
          mediaInfo += extractFileName(voiceLink.getAttribute("href"));
        }
        const lowerText = textForSearch.toLowerCase();
        let includeMsg = searchWord === "" ? true : (searchInside ? lowerText.includes(searchWord) : lowerText.startsWith(searchWord));
        if (includeMsg) {
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
                if (toDate) { toDate.setHours(23,59,59,999); }
                if (!dateObj) return;
                if (fromDate && dateObj < fromDate) return;
                if (toDate && dateObj > toDate) return;
              }
              dateStr = dateObj.toLocaleString(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
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
            if (authorElem) {
              authorText = authorElem.textContent.trim();
            }
            if (!authorText) {
              const initialsElem = msg.querySelector(".userpic .initials");
              if (initialsElem) {
                authorText = initialsElem.textContent.trim();
              }
            }
            if (authorText) {
              authorLine = "\n" + translations[currentLang].authorLabel + authorText;
            }
          }
          let finalMsg = dateStr ? `${dateStr}${authorLine}\n\n${textForSearch}` : `${textForSearch}${authorLine}`;
          if (mediaInfo) {
            finalMsg += `\n\n${mediaInfo}`;
          }
          results.push(finalMsg + "\n\n-----------------------------------\n\n");
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
      outputDiv.innerText = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      filteredText = finalResult;
    }
    function formatDateForFile(date) {
      return date.toLocaleDateString("ru-RU", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\./g, "-");
    }
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(filteredText).then(() => {
        const isLight = document.body.classList.contains("light-theme");
        copyBtn.style.backgroundColor = isLight ? "var(--btn-light-pressed)" : "var(--btn-dark-pressed)";
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
      if (cachedJsonData) {
        const currentLang = document.querySelector('input[name="language"]:checked').value;
        dropText.textContent = selectedFileName
          ? translations[currentLang].fileSelected + selectedFileName
          : translations[currentLang].dropText;
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
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
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
    });
    dropArea.addEventListener("drop", function (e) {
      e.preventDefault();
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        handleFile(file);
      }
    });
    function handleDropClick(e) {
      e.stopPropagation();
      fileInput.click();
    }
    // Ensure the click handler is added only once.
    dropArea.removeEventListener("click", handleDropClick);
    dropArea.addEventListener("click", handleDropClick);
    function refreshParsedResults() {
      if (!cachedJsonData) return;
      if (isHTMLFile(cachedJsonData)) {
        processHTML(cachedJsonData.rawContent);
      } else {
        processJSON(cachedJsonData);
      }
    }
    searchWordInput.addEventListener('input', refreshParsedResults);
    searchInsideCheck.addEventListener('change', refreshParsedResults);
    showAuthorCheck.addEventListener('change', refreshParsedResults);
    dateRangeCheckbox.addEventListener('change', refreshParsedResults);
    document.getElementById("date-from").addEventListener('change', refreshParsedResults);
    document.getElementById("date-to").addEventListener('change', refreshParsedResults);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTelegram);
  } else {
    initTelegram();
  }
})();
