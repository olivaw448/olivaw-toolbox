(function initWhatsAppModule() {
  if (currentExportType !== "whatsapp") return;
  if (window.whatsappModuleInitialized) return;
  window.whatsappModuleInitialized = true;
  console.log("WhatsApp module initialized, currentExportType:", currentExportType);

  function initWhatsApp() {
    // Module variables
    let cachedFileContent = null;
    let selectedFileName = "";
    let currentFileReader = null;
    let isCanceled = false;
    let filteredText = "";
    let generatedFileName = "whatsapp.txt";

    console.log("WhatsApp: initWhatsApp: Data reset");

    // DOM elements
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const dropText = document.getElementById("drop-text");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const outputDiv = document.getElementById("output");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const searchWordInput = document.getElementById("search-word");
    const searchInsideCheck = document.getElementById("search-inside");
    const showAuthorCheck = document.getElementById("show-author");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const cancelBtn = document.getElementById("cancel-btn");
    const dateRangeCheckbox = document.getElementById("date-range-checkbox");
    const dateRangeFields = document.getElementById("date-range-fields");

    // Local translations for WhatsApp
    const translations = {
      en: {
        title: "WhatsApp Chat Parser",
        description: "WhatsApp Sample text",
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
        whatsappDropText: "Drag and drop a ZIP or TXT file here or click to select",
        whatsappNoChatFile: "Error: _chat.txt not found in ZIP archive."
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
        authorLabel: "Author: ",
        dateRangeLabel: "Date range",
        dateFromPlaceholder: "From",
        dateToPlaceholder: "To",
        whatsappDropText: "Перетащите ZIP или TXT файл сюда или нажмите для выбора",
        whatsappNoChatFile: "Ошибка: Файл _chat.txt не найден в ZIP архиве."
      },
      ua: {
        title: "Парсер WhatsApp чату",
        description: "Sample text",
        searchLabelBegin: "Введіть слово для пошуку на початку кожного повідомлення:",
        searchLabelAnywhere: "Введіть рядок для пошуку у будь-якому місці кожного повідомлення:",
        dropText: "Перетащіть ZIP або TXT файл сюди або натисніть для вибору",
        fileSelected: "Файл обрано: ",
        copyBtn: "Скопіювати",
        downloadBtn: "Завантажити результат",
        noMessages: "Повідомлень із заданим словом не знайдено.",
        cancel: "Скасувати",
        searchInsideLabel: "Шукати рядок усередині повідомлень",
        showAuthorLabel: "Показувати автора повідомлення",
        authorLabel: "Author: ",
        dateRangeLabel: "Date range",
        dateFromPlaceholder: "From",
        dateToPlaceholder: "To",
        whatsappDropText: "Перетащіть ZIP або TXT файл сюди або натисніть для вибору",
        whatsappNoChatFile: "Помилка: Файл _chat.txt не найден в ZIP архиве."
      }
    };

    // Update drop area interface based on file selection and language
    function updateInterface() {
      if (selectedFileName === "") {
        dropText.textContent = translations[currentLanguage].whatsappDropText;
      } else {
        dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
      }
      document.getElementById("date-from").placeholder = translations[currentLanguage].dateFromPlaceholder;
      document.getElementById("date-to").placeholder = translations[currentLanguage].dateToPlaceholder;
      document.getElementById("date-range-label").textContent = translations[currentLanguage].dateRangeLabel;
    }
    updateInterface();
    document.querySelectorAll('input[name="language"]').forEach(radio => {
      radio.addEventListener("change", () => {
        updateInterface();
        if (cachedFileContent && currentExportType === "whatsapp") {
          processWhatsApp(cachedFileContent);
        }
      });
    });

    // Expose updateInterface and getWhatsappDropText globally for index.js usage
    window.updateInterface = updateInterface;
    window.getWhatsappDropText = function() {
      return selectedFileName === "" ? translations[currentLanguage].whatsappDropText : translations[currentLanguage].fileSelected + selectedFileName;
    };

    // Utility: Normalize newline characters
    function normalizeNewlines(text) {
      return text.replace(/\r\n/g, "\n");
    }

    // Parse WhatsApp date and time into a Date object
    function parseWhatsAppDate(dateStr, timeStr) {
      const parts = dateStr.split('.');
      if (parts.length < 3) return null;
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const timeParts = timeStr.split(':');
      if (timeParts.length < 3) return null;
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      let seconds = parseInt(timeParts[2], 10);
      return new Date(year, month, day, hours, minutes, seconds);
    }

    // Format date for filename using ru-RU locale
    function formatDateForFile(date) {
      return date.toLocaleDateString("ru-RU", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
      }).replace(/\./g, "-");
    }

    // Global regex to capture header and message block (non-greedy)
    // Pattern: [dd.mm.yy, hh:mm:ss] optional(~) username: message text (until next header or end)
    const headerRegex = /\[(\d{2}\.\d{2}\.\d{2}),\s*(\d{2}:\d{2}:\d{2})\]\s*(?:~\s*)?([^:]+):([\s\S]*?)(?=\n?\[\d{2}\.\d{2}\.\d{2},|\s*$)/g;

    // Process WhatsApp export content
    function processWhatsApp(content) {
      console.log("WhatsApp: processWhatsApp called");
      // For non-zip files, content is a string; for zip files, it is an ArrayBuffer.
      // If content is a string, normalize newlines.
      if (typeof content === "string") {
        content = normalizeNewlines(content);
      }
      let messages = [];
      let match;
      // Use global regex to find all messages
      while ((match = headerRegex.exec(content)) !== null) {
        let username = match[3].trim();
        if (username.startsWith("~")) {
          username = username.substring(1).trim();
        }
        // Remove only leading spaces from message text
        let text = match[4] ? match[4].replace(/^\s+/, "") : "";
        messages.push({
          date: parseWhatsAppDate(match[1], match[2]),
          username: username,
          text: text
        });
        console.log("WhatsApp: Parsed message:", { date: match[1], time: match[2], username, text });
      }
      console.log("WhatsApp: Total messages parsed:", messages.length);

      // Apply filters: date range and search word
      let fromDate = null, toDate = null;
      if (dateRangeCheckbox.checked) {
        const dateFromVal = document.getElementById("date-from").value;
        const dateToVal = document.getElementById("date-to").value;
        fromDate = dateFromVal ? new Date(dateFromVal) : null;
        toDate = dateToVal ? new Date(dateToVal) : null;
        if (toDate) { toDate.setHours(23, 59, 59, 999); }
      }
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = searchInsideCheck.checked;
      const filteredMessages = messages.filter(msg => {
        if (searchWord !== "") {
          const lowerText = msg.text.toLowerCase();
          if (searchInside) {
            if (!lowerText.includes(searchWord)) return false;
          } else {
            if (!lowerText.startsWith(searchWord)) return false;
          }
        }
        if (fromDate && msg.date < fromDate) return false;
        if (toDate && msg.date > toDate) return false;
        return true;
      });
      console.log("WhatsApp: Messages after filtering:", filteredMessages.length);

      if (filteredMessages.length === 0) {
        outputDiv.textContent = translations[currentLanguage].noMessages;
        outputDiv.style.display = "block";
        copyBtn.style.display = "none";
        downloadBtn.style.display = "none";
        return;
      }

      // Sort messages by date
      filteredMessages.sort((a, b) => a.date - b.date);
      const results = [];
      const dates = [];
      const is24Hour = (currentLanguage === "ru" || currentLanguage === "ua");
      filteredMessages.forEach(msg => {
        const formattedDate = msg.date.toLocaleString(
          currentLanguage === "en" ? "en-US" : (currentLanguage === "ru" ? "ru-RU" : "uk-UA"),
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: !is24Hour
          }
        ).replace(",", "");
        const dayOfWeek = msg.date.toLocaleDateString(
          currentLanguage === "en" ? "en-US" : (currentLanguage === "ru" ? "ru-RU" : "uk-UA"),
          { weekday: "long" }
        );
        let authorLine = "";
        if (showAuthorCheck.checked) {
          authorLine = "\n" + translations[currentLanguage].authorLabel + msg.username;
        }
        results.push(`${formattedDate} (${dayOfWeek})${authorLine}\n\n${msg.text}\n\n-----------------------------------\n\n`);
        dates.push(msg.date);
      });
      const plainTextResult = results.join("");
      const finalResult = plainTextResult.trimEnd();
      console.log("WhatsApp: Final result before output:", finalResult);

      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        const firstDate = formatDateForFile(dates[0]);
        const lastDate = formatDateForFile(dates[dates.length - 1]);
        generatedFileName = `whatsapp-${firstDate}-to-${lastDate}.txt`;
      } else {
        generatedFileName = "whatsapp.txt";
      }
      filteredText = finalResult;
      // Use textContent to preserve newlines when copying
      outputDiv.textContent = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      console.log("WhatsApp final result:", finalResult);
    }

    // Reset filters when a new file is chosen
    function resetFilters() {
      if (searchWordInput) searchWordInput.value = "";
      if (searchInsideCheck) searchInsideCheck.checked = false;
      if (showAuthorCheck) showAuthorCheck.checked = false;
      if (dateRangeCheckbox) {
        dateRangeCheckbox.checked = false;
        if (dateRangeFields) dateRangeFields.style.display = "none";
      }
      updateInterface();
    }

    // Handle file selection and reading
    function handleFile(file) {
      resetFilters();
      selectedFileName = file.name;
      isCanceled = false;
      currentFileReader = new FileReader();
      currentFileReader.onloadstart = function () {
        progressBarInner.style.width = "0%";
        progressOverlay.style.display = "flex";
        console.log("WhatsApp: File reading started for:", file.name);
      };
      currentFileReader.onload = function (e) {
        if (isCanceled) return;
        let content;
        // For ZIP files, do not call trim() (ArrayBuffer); for text files, trim string.
        if (file.name.toLowerCase().endsWith(".zip")) {
          content = e.target.result;
        } else {
          content = e.target.result.trim();
        }
        fileInput.value = "";
        console.log("WhatsApp: File read completed for:", file.name);
        if (file.name.toLowerCase().endsWith(".zip")) {
          // Process ZIP file: try to find _chat.txt (case-insensitive), or fallback to any .txt file
          JSZip.loadAsync(content).then(zip => {
            let chatFiles = zip.file(/_chat\.txt$/i);
            if (!chatFiles || chatFiles.length === 0) {
              chatFiles = zip.file(/\.txt$/i);
            }
            if (!chatFiles || chatFiles.length === 0) {
              outputDiv.textContent = translations[currentLanguage].whatsappNoChatFile;
              outputDiv.style.display = "block";
              progressOverlay.style.display = "none";
              console.log("WhatsApp: ZIP file does not contain a chat text file");
              return;
            }
            return chatFiles[0].async("string");
          }).then(text => {
            if (text) {
              cachedFileContent = text;
              processWhatsApp(text);
            }
            progressOverlay.style.display = "none";
          }).catch(err => {
            outputDiv.textContent = "Error: " + err;
            outputDiv.style.display = "block";
            progressOverlay.style.display = "none";
            console.log("WhatsApp: Error processing ZIP:", err);
          });
        } else {
          cachedFileContent = content;
          processWhatsApp(content);
          dropText.textContent = translations[currentLanguage].fileSelected + file.name;
          dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
            ? "var(--light-drop-selected)"
            : "var(--dark-drop-bg)";
          progressOverlay.style.display = "none";
        }
        console.log("WhatsApp: File processed:", selectedFileName);
      };
      currentFileReader.onerror = function () {
        progressOverlay.style.display = "none";
        console.log("WhatsApp: Error reading file");
      };
      currentFileReader.onabort = function () {
        progressOverlay.style.display = "none";
        console.log("WhatsApp: File reading aborted");
      };
      if (file.name.toLowerCase().endsWith(".zip")) {
        currentFileReader.readAsArrayBuffer(file);
      } else {
        currentFileReader.readAsText(file);
      }
    }

    // Event listener for file input change
    fileInput.addEventListener("change", function () {
      if (currentExportType !== "whatsapp") {
        console.log("WhatsApp: Ignoring fileInput change – currentExportType is not whatsapp");
        return;
      }
      if (fileInput.files && fileInput.files.length > 0) {
        selectedFileName = fileInput.files[0].name;
        console.log("WhatsApp: File input change, file:", selectedFileName);
        handleFile(fileInput.files[0]);
      }
    });

    // Drop area click event
    dropArea.addEventListener("click", function () {
      if (currentExportType !== "whatsapp") {
        console.log("WhatsApp: Ignoring dropArea click – currentExportType is not whatsapp");
        return;
      }
      console.log("WhatsApp: Drop area clicked");
      fileInput.click();
    });

    // Drag and drop events
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
      if (currentExportType !== "whatsapp") {
        console.log("WhatsApp: Ignoring drop event – currentExportType is not whatsapp");
        return;
      }
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        selectedFileName = file.name;
        console.log("WhatsApp: Drop event, file:", selectedFileName);
        handleFile(file);
      }
    });

    // Filter event listeners – update result if module active
    searchWordInput.addEventListener("input", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    searchInsideCheck.addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    showAuthorCheck.addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    dateRangeCheckbox.addEventListener("change", function () {
      dateRangeFields.style.display = dateRangeCheckbox.checked ? "block" : "none";
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    document.getElementById("date-from").addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    document.getElementById("date-to").addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });

    // Copy button – copy text preserving newlines
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

    // Download button – download the final output text
    downloadBtn.addEventListener("click", function () {
      const blob = new Blob([filteredText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = generatedFileName;
      link.click();
    });

    // Theme toggle – update drop area text accordingly
    themeToggleBtn.addEventListener("click", function () {
      if (document.body.classList.contains("light-theme")) {
        document.body.classList.remove("light-theme");
        themeToggleBtn.textContent = "Light mode";
      } else {
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "Dark mode";
      }
      if (cachedFileContent && currentExportType === "whatsapp") {
        dropText.textContent = selectedFileName === ""
          ? translations[currentLanguage].whatsappDropText
          : translations[currentLanguage].fileSelected + selectedFileName;
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
      }
    });

    // Cancel button – abort file reading
    cancelBtn.addEventListener("click", function () {
      if (currentFileReader) {
        isCanceled = true;
        currentFileReader.abort();
        console.log("WhatsApp: File reading aborted");
      }
      progressOverlay.style.display = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhatsApp);
  } else {
    initWhatsApp();
  }
})();
