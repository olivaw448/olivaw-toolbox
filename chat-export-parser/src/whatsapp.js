(function initWhatsAppModule() {
  // Replace old event listeners by cloning the file-input and drop-area elements
  // This removes any previously attached event handlers from earlier module initializations.
  const fileInputOld = document.getElementById("file-input");
  if (fileInputOld) {
    const newFileInput = fileInputOld.cloneNode(true);
    fileInputOld.parentNode.replaceChild(newFileInput, fileInputOld);
  }
  const dropAreaOld = document.getElementById("drop-area");
  if (dropAreaOld) {
    const newDropArea = dropAreaOld.cloneNode(true);
    dropAreaOld.parentNode.replaceChild(newDropArea, dropAreaOld);
  }

  // Initialize module only if current export type is "whatsapp"
  if (currentExportType !== "whatsapp") return;

  function initWhatsApp() {
    // Module variables
    let cachedFileContent = null;
    let selectedFileName = "";
    let currentFileReader = null;
    let isCanceled = false;
    let filteredText = "";
    let generatedFileName = "whatsapp.txt";

    // Get common DOM elements
    const fileInput = document.getElementById("file-input");
    const dropArea = document.getElementById("drop-area");
    const dropText = document.getElementById("drop-text");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const outputDiv = document.getElementById("output");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const searchWordInput = document.getElementById("search-word");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const cancelBtn = document.getElementById("cancel-btn");

    // Get common page elements (title and description)
    const titleElem = document.getElementById("title");
    const descriptionElem = document.getElementById("description");

    // Local translations for WhatsApp
    const translations = {
      en: {
        title: "WhatsApp Chat Parser",
        description: "Parse your WhatsApp chat export.",
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
        description: "Разберите экспорт чата WhatsApp.",
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
        dateRangeLabel: "Диапазон дат",
        dateFromPlaceholder: "От",
        dateToPlaceholder: "До",
        whatsappDropText: "Перетащите ZIP или TXT файл сюда или нажмите для выбора",
        whatsappNoChatFile: "Ошибка: Файл _chat.txt не найден в ZIP архиве."
      },
      ua: {
        title: "Парсер WhatsApp чату",
        description: "Розберіть експорт чату WhatsApp.",
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
        authorLabel: "Author: ",
        dateRangeLabel: "Діапазон дат",
        dateFromPlaceholder: "Від",
        dateToPlaceholder: "До",
        whatsappDropText: "Перетягніть ZIP або TXT файл сюди або натисніть для вибору",
        whatsappNoChatFile: "Помилка: Файл _chat.txt не знайден в ZIP архиві."
      }
    };

    // Insert dynamic parameter elements for WhatsApp into the container
    const parametersContainer = document.getElementById("future-parameters-container");
    if (parametersContainer) {
      parametersContainer.innerHTML = `
        <div id="whatsapp-parameters">
          <div>
            <input type="checkbox" id="search-inside">
            <label for="search-inside">${translations[currentLanguage].searchInsideLabel}</label>
          </div>
          <div>
            <input type="checkbox" id="show-author">
            <label for="show-author">${translations[currentLanguage].showAuthorLabel}</label>
          </div>
          <div>
            <input type="checkbox" id="date-range-checkbox">
            <label id="date-range-label" for="date-range-checkbox">${translations[currentLanguage].dateRangeLabel}</label>
          </div>
          <div id="date-range-fields" style="display:none;">
            <input type="date" id="date-from" placeholder="${translations[currentLanguage].dateFromPlaceholder}">
            <input type="date" id="date-to" placeholder="${translations[currentLanguage].dateToPlaceholder}">
          </div>
        </div>
      `;
    }

    // Utility function to normalize newline characters
    function normalizeNewlines(text) {
      return text.replace(/\r\n/g, "\n");
    }

    // Function to parse WhatsApp date and time into a Date object
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

    // Function to format a date for the filename using ru-RU locale
    function formatDateForFile(date) {
      return date.toLocaleDateString("ru-RU", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
      }).replace(/\./g, "-");
    }

    // Global regex to parse messages from the chat export
    const headerRegex = /\[(\d{2}\.\d{2}\.\d{2}),\s*(\d{2}:\d{2}:\d{2})\]\s*(?:~\s*)?([^:]+):([\s\S]*?)(?=\n?\[\d{2}\.\d{2}\.\d{2},|\s*$)/g;

    // Function to update drop area text and date placeholders
    function updateInterface() {
      if (selectedFileName === "") {
        dropText.textContent = translations[currentLanguage].whatsappDropText;
      } else {
        dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
      }
      const dateFromInput = document.getElementById("date-from");
      const dateToInput = document.getElementById("date-to");
      if (dateFromInput) dateFromInput.placeholder = translations[currentLanguage].dateFromPlaceholder;
      if (dateToInput) dateToInput.placeholder = translations[currentLanguage].dateToPlaceholder;
      const dateRangeLabelElem = document.getElementById("date-range-label");
      if (dateRangeLabelElem) dateRangeLabelElem.textContent = translations[currentLanguage].dateRangeLabel;
    }
    updateInterface();

    // Function to update the WhatsApp interface when language changes
    function updateWhatsAppInterface() {
      updateInterface();
      if (titleElem) titleElem.textContent = translations[currentLanguage].title;
      if (descriptionElem) descriptionElem.textContent = translations[currentLanguage].description;
      const whatsappParams = document.getElementById("whatsapp-parameters");
      if (whatsappParams) {
        const searchInsideLabel = whatsappParams.querySelector('label[for="search-inside"]');
        if (searchInsideLabel) searchInsideLabel.textContent = translations[currentLanguage].searchInsideLabel;
        const showAuthorLabel = whatsappParams.querySelector('label[for="show-author"]');
        if (showAuthorLabel) showAuthorLabel.textContent = translations[currentLanguage].showAuthorLabel;
        const dateRangeLabelElem = whatsappParams.querySelector('label[for="date-range-checkbox"]');
        if (dateRangeLabelElem) dateRangeLabelElem.textContent = translations[currentLanguage].dateRangeLabel;
      }
      const searchLabelElem = document.getElementById("search-label");
      if (searchLabelElem) {
        const searchInsideCheckbox = document.getElementById("search-inside");
        if (searchInsideCheckbox && searchInsideCheckbox.checked) {
          searchLabelElem.textContent = translations[currentLanguage].searchLabelAnywhere;
        } else {
          searchLabelElem.textContent = translations[currentLanguage].searchLabelBegin;
        }
      }
      if (cachedFileContent && currentExportType === "whatsapp") {
        processWhatsApp(cachedFileContent);
      }
    }
    // Bind language change events to update the interface
    document.querySelectorAll('input[name="language"]').forEach(radio => {
      radio.addEventListener("change", updateWhatsAppInterface);
      radio.addEventListener("click", updateWhatsAppInterface);
    });

    // Function to process the WhatsApp chat content
    function processWhatsApp(content) {
      console.log("WhatsApp: processWhatsApp called");
      if (typeof content === "string") {
        content = normalizeNewlines(content);
      }
      let messages = [];
      let match;
      while ((match = headerRegex.exec(content)) !== null) {
        let username = match[3].trim();
        if (username.startsWith("~")) {
          username = username.substring(1).trim();
        }
        let text = match[4] ? match[4].replace(/^\s+/, "") : "";
        messages.push({
          date: parseWhatsAppDate(match[1], match[2]),
          username: username,
          text: text
        });
        console.log("WhatsApp: Parsed message:", { date: match[1], time: match[2], username, text });
      }
      console.log("WhatsApp: Total messages parsed:", messages.length);

      // Filter messages based on date range and search keyword
      let fromDate = null, toDate = null;
      const dateRangeCheckbox = document.getElementById("date-range-checkbox");
      if (dateRangeCheckbox && dateRangeCheckbox.checked) {
        const dateFromVal = document.getElementById("date-from").value;
        const dateToVal = document.getElementById("date-to").value;
        fromDate = dateFromVal ? new Date(dateFromVal) : null;
        toDate = dateToVal ? new Date(dateToVal) : null;
        if (toDate) { toDate.setHours(23, 59, 59, 999); }
      }
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInsideCheck = document.getElementById("search-inside");
      const filteredMessages = messages.filter(msg => {
        if (searchWord !== "") {
          const lowerText = msg.text.toLowerCase();
          if (searchInsideCheck && searchInsideCheck.checked) {
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

      // Sort messages by date and build output text
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
        const showAuthorCheck = document.getElementById("show-author");
        if (showAuthorCheck && showAuthorCheck.checked) {
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
      outputDiv.textContent = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      console.log("WhatsApp final result:", finalResult);
    }

    // Function to reset filters when a new file is chosen
    function resetFilters() {
      if (searchWordInput) searchWordInput.value = "";
      const searchInsideCheck = document.getElementById("search-inside");
      if (searchInsideCheck) searchInsideCheck.checked = false;
      const showAuthorCheck = document.getElementById("show-author");
      if (showAuthorCheck) showAuthorCheck.checked = false;
      const dateRangeCheckbox = document.getElementById("date-range-checkbox");
      if (dateRangeCheckbox) {
        dateRangeCheckbox.checked = false;
        const dateRangeFields = document.getElementById("date-range-fields");
        if (dateRangeFields) dateRangeFields.style.display = "none";
      }
      updateInterface();
    }

    // Function to handle file selection
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
        if (file.name.toLowerCase().endsWith(".zip")) {
          content = e.target.result;
        } else {
          content = e.target.result.trim();
        }
        fileInput.value = "";
        console.log("WhatsApp: File read completed for:", file.name);
        if (file.name.toLowerCase().endsWith(".zip")) {
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

    // Add event listener for file input change
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

    // Add event listener for drop area click
    dropArea.addEventListener("click", function () {
      if (currentExportType !== "whatsapp") {
        console.log("WhatsApp: Ignoring dropArea click – currentExportType is not whatsapp");
        return;
      }
      console.log("WhatsApp: Drop area clicked");
      fileInput.click();
    });

    // Add drag and drop event listeners
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

    // Add event listeners for filter inputs to re-process the file when changed
    searchWordInput.addEventListener("input", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    const searchInsideCheckbox = document.getElementById("search-inside");
    if (searchInsideCheckbox) {
      searchInsideCheckbox.addEventListener("change", function () {
        if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
      });
    }
    const showAuthorCheckbox = document.getElementById("show-author");
    if (showAuthorCheckbox) {
      showAuthorCheckbox.addEventListener("change", function () {
        if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
      });
    }
    const dateRangeCheckbox = document.getElementById("date-range-checkbox");
    const dateRangeFields = document.getElementById("date-range-fields");
    if (dateRangeCheckbox) {
      dateRangeCheckbox.addEventListener("change", function () {
        dateRangeFields.style.display = dateRangeCheckbox.checked ? "block" : "none";
        if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
      });
    }
    document.getElementById("date-from").addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });
    document.getElementById("date-to").addEventListener("change", function () {
      if (cachedFileContent && currentExportType === "whatsapp") processWhatsApp(cachedFileContent);
    });

    // Add event listener for the Copy button
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

    // Add event listener for the Download button
    downloadBtn.addEventListener("click", function () {
      const blob = new Blob([filteredText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = generatedFileName;
      link.click();
    });

    // Add event listener for the theme toggle button
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

    // Add event listener for the Cancel button
    cancelBtn.addEventListener("click", function () {
      if (currentFileReader) {
        isCanceled = true;
        currentFileReader.abort();
        console.log("WhatsApp: File reading aborted");
      }
      progressOverlay.style.display = "none";
    });

    // Call updateWhatsAppInterface immediately after initialization to set the correct texts
    updateWhatsAppInterface();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhatsApp);
  } else {
    initWhatsApp();
  }
})();
