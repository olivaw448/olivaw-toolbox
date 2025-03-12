(function initMatrixModule() {
    // Activate module only if exportType === "matrix"
    if (currentExportType !== "matrix") return;
    console.log("Matrix module initialized, currentExportType:", currentExportType);
  
    // Translation strings for Matrix with new keys
    const translations = {
      en: {
        title: "Matrix Chat Parser",
        description: "Parse your Matrix chat export.",
        dropText: "Drag and drop a JSON file here or click to select",
        fileSelected: "File selected: ",
        copyBtn: "Copy",
        downloadBtn: "Download result",
        noMessages: "No messages found.",
        cancel: "Cancel",
        searchInsideLabel: "Search string inside messages",
        showAuthorLabel: "Show message Author",
        filterUserIdLabel: "Search by user_id(s):",
        filterUserIdInputPlaceholder: "Enter user_id(s) separated by comma",
        dateRangeLabel: "Date range",
        dateFromPlaceholder: "From",
        dateToPlaceholder: "To",
        debugLabel: "Debug (Full info)"
      },
      ru: {
        title: "Парсер Matrix Чата",
        description: "Разберите экспорт чата Matrix.",
        dropText: "Перетащите JSON файл сюда или нажмите для выбора",
        fileSelected: "Файл выбран: ",
        copyBtn: "Копировать",
        downloadBtn: "Скачать результат",
        noMessages: "Сообщений не найдено.",
        cancel: "Отмена",
        searchInsideLabel: "Искать строку внутри сообщений",
        showAuthorLabel: "Показывать автора сообщения",
        filterUserIdLabel: "Искать по user_id(ам):",
        filterUserIdInputPlaceholder: "Введите user_id(ы) через запятую",
        dateRangeLabel: "Диапазон дат",
        dateFromPlaceholder: "От",
        dateToPlaceholder: "До",
        debugLabel: "Отладка (Full info)"
      },
      ua: {
        title: "Парсер Matrix чату",
        description: "Розберіть експорт чату Matrix.",
        dropText: "Перетягніть JSON файл сюди або натисніть для вибору",
        fileSelected: "Файл обрано: ",
        copyBtn: "Скопіювати",
        downloadBtn: "Завантажити результат",
        noMessages: "Повідомлень не знайдено.",
        cancel: "Скасувати",
        searchInsideLabel: "Шукати рядок усередині повідомлень",
        showAuthorLabel: "Показувати автора повідомлення",
        filterUserIdLabel: "Шукати за user_id(ами):",
        filterUserIdInputPlaceholder: "Введіть user_id(и) через кому",
        dateRangeLabel: "Діапазон дат",
        dateFromPlaceholder: "Від",
        dateToPlaceholder: "До",
        debugLabel: "Налагодження (Full info)"
      }
    };
  
    // Get references to DOM elements
    const titleElem = document.getElementById("title");
    const descriptionElem = document.getElementById("description");
    const dropText = document.getElementById("drop-text");
    const fileInput = document.getElementById("file-input");
    const outputDiv = document.getElementById("output");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const searchWordInput = document.getElementById("search-word");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const cancelBtn = document.getElementById("cancel-btn");
  
    // Set drop area text to proper value on initialization
    dropText.textContent = translations[currentLanguage].dropText;
  
    // Insert new filter parameters into the container
    const parametersContainer = document.getElementById("future-parameters-container");
    if (parametersContainer) {
      parametersContainer.innerHTML = `
        <div id="matrix-parameters">
          <div>
            <input type="checkbox" id="search-inside">
            <label for="search-inside">${translations[currentLanguage].searchInsideLabel}</label>
          </div>
          <div>
            <input type="checkbox" id="show-author">
            <label for="show-author">${translations[currentLanguage].showAuthorLabel}</label>
          </div>
          <div>
            <input type="checkbox" id="filter-userid">
            <label for="filter-userid">${translations[currentLanguage].filterUserIdLabel}</label>
          </div>
          <div id="filter-userid-container" style="display:none; margin-left:20px;">
            <input type="text" id="filter-userid-input" placeholder="${translations[currentLanguage].filterUserIdInputPlaceholder}">
          </div>
          <div>
            <input type="checkbox" id="date-range-checkbox">
            <label for="date-range-checkbox">${translations[currentLanguage].dateRangeLabel}</label>
          </div>
          <div id="date-range-fields" style="display:none;">
            <input type="date" id="date-from" placeholder="${translations[currentLanguage].dateFromPlaceholder}">
            <input type="date" id="date-to" placeholder="${translations[currentLanguage].dateToPlaceholder}">
          </div>
          <div>
            <input type="checkbox" id="debug-mode">
            <label for="debug-mode">${translations[currentLanguage].debugLabel}</label>
          </div>
        </div>
      `;
    }
  
    // Set header and description
    if (titleElem) titleElem.textContent = translations[currentLanguage].title;
    if (descriptionElem) descriptionElem.textContent = translations[currentLanguage].description;
  
    // Clear search field
    if (searchWordInput) {
      searchWordInput.value = "";
      searchWordInput.setAttribute("value", "");
    }
  
    let selectedFileName = "";
    let cachedMatrixData = null;
    let currentFileReader = null;
    let isCanceled = false;
    let filteredText = "";
    let generatedFileName = "matrix.txt";
  
    // Utility: remove BOM from string
    function removeBOM(str) {
      return str.replace(/^\uFEFF/, '');
    }
    // Utility: format date for filename
    function formatDateForFile(date) {
      return date.toLocaleDateString("ru-RU", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\./g, "-");
    }
  
    // Build a map of sender to displayname from m.room.member events
    function buildUserDisplayMap(messages) {
      const map = {};
      messages.forEach(msg => {
        if (msg.type === "m.room.member" && msg.content && msg.content.displayname) {
          map[msg.sender] = msg.content.displayname;
        }
      });
      return map;
    }
  
    // Main function to process exported Matrix data
    function processMatrixData(data) {
      console.log("Matrix processData called");
      const messagesArray = data.messages || [];
      const locale = currentLanguage === "en" ? "en-US" : (currentLanguage === "ru" ? "ru-RU" : "uk-UA");
  
      // Build a display name map from membership events
      const userDisplayMap = buildUserDisplayMap(messagesArray);
      console.log("User display map:", userDisplayMap);
  
      // Get filter and option values
      const searchWord = searchWordInput.value.trim().toLowerCase();
      const searchInside = document.getElementById("search-inside").checked;
      const showAuthor = document.getElementById("show-author").checked;
      const debugMode = document.getElementById("debug-mode").checked;
      const filterUserIdChecked = document.getElementById("filter-userid").checked;
      const filterUserIdInput = document.getElementById("filter-userid-input");
      let filterUserIds = [];
      if (filterUserIdChecked && filterUserIdInput) {
        filterUserIds = filterUserIdInput.value.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
      }
      const dateRangeChecked = document.getElementById("date-range-checkbox").checked;
      let fromDate = null, toDate = null;
      if (dateRangeChecked) {
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
        if (msg.content && msg.content.body) {
          messageText = msg.content.body;
        }
        console.log("Processing message", msg.event_id, "body:", messageText);
  
        // Filter by search string
        if (searchWord.length > 0) {
          const lowerText = messageText.toLowerCase();
          if (searchInside) {
            if (!lowerText.includes(searchWord)) {
              console.log("Message", msg.event_id, "filtered out by searchInside");
              return;
            }
          } else {
            if (!lowerText.startsWith(searchWord)) {
              console.log("Message", msg.event_id, "filtered out by searchWord (startsWith)");
              return;
            }
          }
        }
        // Filter by user_id(s)
        if (filterUserIds.length > 0) {
          let senderText = msg.sender ? msg.sender.toLowerCase() : "";
          let userIdText = msg.user_id ? msg.user_id.toLowerCase() : "";
          const matches = filterUserIds.some(filter => senderText.includes(filter) || userIdText.includes(filter));
          if (!matches) {
            console.log("Message", msg.event_id, "filtered out by user_id filter");
            return;
          }
        }
        // Filter by date range
        let dateObj = null;
        if (msg.origin_server_ts) {
          dateObj = new Date(msg.origin_server_ts);
          if (dateRangeChecked) {
            if (fromDate && dateObj < fromDate) {
              console.log("Message", msg.event_id, "filtered out by date (before fromDate)");
              return;
            }
            if (toDate && dateObj > toDate) {
              console.log("Message", msg.event_id, "filtered out by date (after toDate)");
              return;
            }
          }
          dates.push(dateObj);
        }
  
        // In non-debug mode, only process messages that are text (m.text) or contain a file
        if (!debugMode) {
          if (!(msg.content && (msg.content.msgtype === "m.text" || msg.content.file))) {
            console.log("Message", msg.event_id, "skipped: not m.text and no file");
            return;
          }
        }
  
        if (debugMode) {
          // Debug mode: output full JSON of the message
          let debugOutput = "";
          if (dateObj) {
            const formattedDate = dateObj.toLocaleString(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: currentLanguage === "en"
            }).replace(",", "");
            const dayOfWeek = dateObj.toLocaleDateString(locale, { weekday: "long" });
            debugOutput += `${formattedDate} (${dayOfWeek})`;
          }
          debugOutput += "\n" + JSON.stringify(msg, null, 2) + "\n";
          debugOutput += "\n-----------------------------------\n\n";
          results.push(debugOutput);
          console.log("Message", msg.event_id, "processed in Debug mode");
        } else {
          // Normal mode: format output as requested
          let normalOutput = "";
          if (dateObj) {
            const formattedDate = dateObj.toLocaleString(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: currentLanguage === "en"
            }).replace(",", "");
            const dayOfWeek = dateObj.toLocaleDateString(locale, { weekday: "long" });
            normalOutput += `${formattedDate} (${dayOfWeek})`;
          }
          // If "Show message Author" is enabled, add sender info: sender - user_id - displayname (if available)
          if (showAuthor) {
            let authorLine = "";
            if (msg.sender) {
              authorLine += msg.sender;
            }
            if (msg.user_id) {
              authorLine += " - " + msg.user_id;
            }
            if (msg.content && msg.content.displayname) {
              authorLine += " - " + msg.content.displayname;
            } else if (userDisplayMap[msg.sender]) {
              authorLine += " - " + userDisplayMap[msg.sender];
            }
            if (authorLine) {
              normalOutput += "\nSender: " + authorLine;
            }
          }
          normalOutput += "\n\n";
          // Build message content output:
          // If message contains a file, output: body - size - mimetype;
          // otherwise, if it's a text message, output the body.
          let contentLine = "";
          if (msg.content) {
            if (msg.content.file && msg.content.info) {
              contentLine = `${msg.content.body} - ${msg.content.info.size} - ${msg.content.info.mimetype}`;
            } else if (msg.content.msgtype === "m.text") {
              contentLine = msg.content.body;
            } else {
              contentLine = msg.content.body || "";
            }
          }
          normalOutput += contentLine;
          normalOutput += "\n\n-----------------------------------\n\n";
          results.push(normalOutput);
          console.log("Message", msg.event_id, "processed in Normal mode with content:", contentLine);
        }
      });
  
      if (results.length === 0) {
        outputDiv.textContent = translations[currentLanguage].noMessages;
        outputDiv.style.display = "block";
        copyBtn.style.display = "none";
        downloadBtn.style.display = "none";
        return;
      }
  
      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        const firstDate = formatDateForFile(dates[0]);
        const lastDate = formatDateForFile(dates[dates.length - 1]);
        generatedFileName = `matrix-${firstDate}-to-${lastDate}.txt`;
      } else {
        generatedFileName = "matrix.txt";
      }
      // Trim the final result to remove extra newlines at the beginning and end
      const finalResult = results.join("").trim();
      filteredText = finalResult;
      outputDiv.textContent = finalResult;
      outputDiv.style.display = "block";
      copyBtn.style.display = "inline-block";
      downloadBtn.style.display = "inline-block";
      console.log("Matrix final result generated.");
    }
  
    // Function to handle the selected file
    function handleFile(file) {
      console.log("Matrix: handleFile called for file:", file.name);
      selectedFileName = file.name;
      isCanceled = false;
      currentFileReader = new FileReader();
      currentFileReader.onloadstart = function() {
        progressBarInner.style.width = "0%";
        progressOverlay.style.display = "flex";
        console.log("Matrix: File reading started for:", file.name);
      };
      currentFileReader.onload = function(e) {
        if (isCanceled) return;
        let content = e.target.result.trim();
        fileInput.value = "";
        console.log("Matrix: File read completed for:", file.name);
        try {
          const jsonData = JSON.parse(removeBOM(content));
          cachedMatrixData = jsonData;
          processMatrixData(jsonData);
        } catch (err) {
          outputDiv.textContent = "Error: Invalid JSON format!";
          outputDiv.style.display = "block";
          copyBtn.style.display = "none";
          downloadBtn.style.display = "none";
        }
        dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
        const dropArea = document.getElementById("drop-area");
        dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
          ? "var(--light-drop-selected)"
          : "var(--dark-drop-bg)";
        progressOverlay.style.display = "none";
        console.log("Matrix: File processed:", selectedFileName);
      };
      currentFileReader.onerror = function() {
        progressOverlay.style.display = "none";
        console.log("Matrix: Error reading file");
      };
      currentFileReader.onabort = function() {
        progressOverlay.style.display = "none";
        console.log("Matrix: File reading aborted");
      };
      currentFileReader.readAsText(file);
    }
  
    // File input change event
    fileInput.addEventListener("change", function() {
      if (fileInput.files && fileInput.files.length > 0) {
        selectedFileName = fileInput.files[0].name;
        console.log("Matrix: File input change, file:", selectedFileName);
        handleFile(fileInput.files[0]);
      }
    });
  
    // Drag & drop events
    const dropArea = document.getElementById("drop-area");
    dropArea.addEventListener("dragover", function(e) {
      e.preventDefault();
      dropArea.style.backgroundColor = "#555";
    });
    dropArea.addEventListener("dragleave", function() {
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
    });
    dropArea.addEventListener("drop", function(e) {
      e.preventDefault();
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-bg)"
        : "var(--dark-drop-bg)";
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        selectedFileName = file.name;
        console.log("Matrix: Drop event, file:", selectedFileName);
        handleFile(file);
      }
    });
    dropArea.addEventListener("click", function() {
      fileInput.click();
    });
  
    // Attach event listeners for filters – update parsing on change or input
    const filterElements = ["search-word", "search-inside", "show-author", "filter-userid", "date-range-checkbox", "date-from", "date-to", "debug-mode", "filter-userid-input"];
    filterElements.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.addEventListener("change", function() {
          if (cachedMatrixData) processMatrixData(cachedMatrixData);
        });
        elem.addEventListener("input", function() {
          if (cachedMatrixData) processMatrixData(cachedMatrixData);
        });
      }
    });
  
    // Toggle display of user_id input container when filter-userid is changed
    const filterUserIdCheckbox = document.getElementById("filter-userid");
    const filterUserIdContainer = document.getElementById("filter-userid-container");
    if (filterUserIdCheckbox) {
      filterUserIdCheckbox.addEventListener("change", function() {
        filterUserIdContainer.style.display = this.checked ? "block" : "none";
        if (cachedMatrixData) processMatrixData(cachedMatrixData);
      });
    }
  
    // Toggle display of date range fields
    const dateRangeCheckbox = document.getElementById("date-range-checkbox");
    const dateRangeFields = document.getElementById("date-range-fields");
    if (dateRangeCheckbox) {
      dateRangeCheckbox.addEventListener("change", function() {
        dateRangeFields.style.display = this.checked ? "block" : "none";
        if (cachedMatrixData) processMatrixData(cachedMatrixData);
      });
    }
  
    // "Copy" button event
    copyBtn.addEventListener("click", function() {
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
  
    // "Download result" button event
    downloadBtn.addEventListener("click", function() {
      const blob = new Blob([filteredText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = generatedFileName;
      link.click();
    });
  
    // Theme toggle event
    themeToggleBtn.addEventListener("click", function() {
      if (document.body.classList.contains("light-theme")) {
        document.body.classList.remove("light-theme");
        themeToggleBtn.textContent = "Light mode";
      } else {
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "Dark mode";
      }
      if (selectedFileName === "") {
        dropText.textContent = translations[currentLanguage].dropText;
      } else {
        dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
      }
      dropArea.style.backgroundColor = document.body.classList.contains("light-theme")
        ? "var(--light-drop-selected)"
        : "var(--dark-drop-bg)";
    });
  
    // "Cancel" button event
    cancelBtn.addEventListener("click", function() {
      if (currentFileReader) {
        isCanceled = true;
        currentFileReader.abort();
        console.log("Matrix: File reading aborted");
      }
      progressOverlay.style.display = "none";
    });
  
    // Update interface on language change
    document.querySelectorAll('input[name="language"]').forEach(radio => {
      radio.addEventListener("change", function() {
        if (titleElem) titleElem.textContent = translations[currentLanguage].title;
        if (descriptionElem) descriptionElem.textContent = translations[currentLanguage].description;
        if (dropText) {
          dropText.textContent = selectedFileName === ""
            ? translations[currentLanguage].dropText
            : translations[currentLanguage].fileSelected + selectedFileName;
        }
        if (parametersContainer) {
          const searchInsideLabel = document.querySelector('label[for="search-inside"]');
          if (searchInsideLabel) searchInsideLabel.textContent = translations[currentLanguage].searchInsideLabel;
          const showAuthorLabel = document.querySelector('label[for="show-author"]');
          if (showAuthorLabel) showAuthorLabel.textContent = translations[currentLanguage].showAuthorLabel;
          const filterUserIdLabel = document.querySelector('label[for="filter-userid"]');
          if (filterUserIdLabel) filterUserIdLabel.textContent = translations[currentLanguage].filterUserIdLabel;
          const filterUserIdInput = document.getElementById("filter-userid-input");
          if (filterUserIdInput) filterUserIdInput.placeholder = translations[currentLanguage].filterUserIdInputPlaceholder;
          const dateRangeLabel = document.querySelector('label[for="date-range-checkbox"]');
          if (dateRangeLabel) dateRangeLabel.textContent = translations[currentLanguage].dateRangeLabel;
          const dateFromInput = document.getElementById("date-from");
          if (dateFromInput) dateFromInput.placeholder = translations[currentLanguage].dateFromPlaceholder;
          const dateToInput = document.getElementById("date-to");
          if (dateToInput) dateToInput.placeholder = translations[currentLanguage].dateToPlaceholder;
          const debugLabel = document.querySelector('label[for="debug-mode"]');
          if (debugLabel) debugLabel.textContent = translations[currentLanguage].debugLabel;
        }
        if (cachedMatrixData) processMatrixData(cachedMatrixData);
      });
    });
  })();
  