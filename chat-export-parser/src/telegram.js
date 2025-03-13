(function initTelegramModule() {
  // Global defaults
  window.currentLanguage = window.currentLanguage || "en";
  window.currentExportType = window.currentExportType || "telegram";
  
  // Activate module only if export type is telegram
  if (currentExportType !== "telegram") return;
  console.log("telegram module initialized, currentExportType:", currentExportType);
  
  // Extended translations with new keys.
  const translations = {
    en: {
      title: "Telegram Chat Parser",
      description: "Parse your Telegram chat export.",
      searchLabelBegin: "Enter a search word:",
      searchLabelAnywhere: "Search string inside messages",
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
      dateToPlaceholder: "To",
      filterAuthorLabel: "Search by author name(s):",
      filterAuthorInputPlaceholder: "Enter author name(s) separated by comma",
      filterUserIdLabel: "Search by user_id(s) - only JSON file:",
      filterUserIdInputPlaceholder: "Enter user id(s) separated by comma",
      messageIdCheckboxLabel: "Message ID",
      messageIdLabel: "Message ID:",
      replyToLabel: "Reply to:"
    },
    ru: {
      title: "Парсер Telegram Чата",
      description: "Разберите экспорт чата Telegram.",
      searchLabelBegin: "Введите слово для поиска:",
      searchLabelAnywhere: "Введите строку для поиска:",
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
      dateToPlaceholder: "До",
      filterAuthorLabel: "Искать по имени или именам авторов:",
      filterAuthorInputPlaceholder: "Введите имя/имена автора через запятую",
      filterUserIdLabel: "Искать по user_id(ам) - только для JSON файла:",
      filterUserIdInputPlaceholder: "Введите user_id(ы) через запятую",
      messageIdCheckboxLabel: "ID сообщения",
      messageIdLabel: "ID сообщения:",
      replyToLabel: "Ответ на:"
    },
    ua: {
      title: "Парсер Telegram чату",
      description: "Розберіть експорт чату Telegram.",
      searchLabelBegin: "Введіть слово для пошуку:",
      searchLabelAnywhere: "Введіть рядок для пошуку:",
      dropText: "Перетягніть JSON або HTML файл сюди або натисніть для вибору",
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
      filterAuthorLabel: "Шукати за іменем або іменами авторів:",
      filterAuthorInputPlaceholder: "Введіть ім'я/імена автора через кому",
      filterUserIdLabel: "Шукати за user_id(ами) - тільки для JSON файлу:",
      filterUserIdInputPlaceholder: "Введіть user_id(и) через кому",
      messageIdCheckboxLabel: "ID повідомлення",
      messageIdLabel: "ID повідомлення:",
      replyToLabel: "Відповідь на:"
    }
  };
  
  // Get references to DOM elements
  const titleElem = document.getElementById("title");
  const descriptionElem = document.getElementById("description");
  const dropText = document.getElementById("drop-text");
  const searchWordInput = document.getElementById("search-word");
  const fileInput = document.getElementById("file-input");
  const outputDiv = document.getElementById("output");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const progressOverlay = document.getElementById("progress-overlay");
  const progressBarInner = document.getElementById("progress-bar-inner");
  const cancelBtn = document.getElementById("cancel-btn");
  
  // Insert dynamic parameter elements into container
  let selectedFileName = "";
  const parametersContainer = document.getElementById("future-parameters-container");
  if (parametersContainer) {
    parametersContainer.innerHTML = `
      <div id="telegram-parameters">
        <div>
          <input type="checkbox" id="search-inside">
          <label for="search-inside">${translations[currentLanguage].searchInsideLabel}</label>
        </div>
        <div>
          <input type="checkbox" id="show-author">
          <label for="show-author">${translations[currentLanguage].showAuthorLabel}</label>
        </div>
        <div>
          <input type="checkbox" id="filter-author">
          <label for="filter-author">${translations[currentLanguage].filterAuthorLabel}</label>
        </div>
        <div id="filter-author-container" style="display:none; margin-left:20px;">
          <input type="text" id="filter-author-input" placeholder="${translations[currentLanguage].filterAuthorInputPlaceholder}">
        </div>
        <div>
          <input type="checkbox" id="filter-userid">
          <label for="filter-userid">${translations[currentLanguage].filterUserIdLabel}</label>
        </div>
        <div id="filter-userid-container" style="display:none; margin-left:20px;">
          <input type="text" id="filter-userid-input" placeholder="${translations[currentLanguage].filterUserIdInputPlaceholder}">
        </div>
        <div>
          <input type="checkbox" id="message-id-checkbox">
          <label for="message-id-checkbox">${translations[currentLanguage].messageIdCheckboxLabel}</label>
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
  
  // Set header and description
  if (titleElem) titleElem.textContent = translations[currentLanguage].title;
  if (descriptionElem) descriptionElem.textContent = translations[currentLanguage].description;
  
  // Clear search field
  if (searchWordInput) {
    searchWordInput.value = "";
    searchWordInput.setAttribute("value", "");
  }
  
  // Utility functions
  function removeBOM(str) { return str.replace(/^\uFEFF/, ''); }
  function parseDate(dateStr) {
    const regex = /^(\d{2})[\/.](\d{2})[\/.](\d{4})(.*)$/;
    return regex.test(dateStr)
      ? new Date(dateStr.replace(regex, "$3-$2-$1$4"))
      : new Date(dateStr);
  }
  function extractFileName(path) {
    const parts = path.split("/");
    return "**" + parts[parts.length - 1] + "**";
  }
  function formatDateForFile(date) {
    return date.toLocaleDateString("ru-RU", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\./g, "-");
  }
  
  // Helper for HTML parser: if current message lacks an author, try to get it from previous joined messages
  function getJoinedAuthor(msg) {
    let prev = msg.previousElementSibling;
    while (prev) {
      if (!prev.classList.contains("service")) {
        let fromElem = prev.querySelector(".from_name");
        if (fromElem && fromElem.textContent.trim() !== "") {
          return fromElem.textContent.trim();
        }
      }
      prev = prev.previousElementSibling;
    }
    return "";
  }
  
  // Build reply mapping for JSON messages
  function buildReplyMapJSON(messagesArray) {
    const replyMap = {};
    messagesArray.forEach(m => {
      let txt = "";
      if (m.text && typeof m.text === "string") {
        txt = m.text;
      } else if (Array.isArray(m.text)) {
        txt = m.text.map(part => (typeof part === "string" ? part : part.text)).join("");
      }
      txt = txt.trim();
      if (txt.length > 0 && m.id) {
        let snippet = txt.substring(0, 11) + (txt.length > 11 ? "..." : "");
        replyMap[m.id] = snippet;
      }
    });
    return replyMap;
  }
  
  // Build reply mapping for HTML messages
  function buildReplyMapHTML(messagesNodes) {
    const replyMap = {};
    messagesNodes.forEach(m => {
      let msgId = "";
      if (m.hasAttribute("data-msgid")) {
        msgId = m.getAttribute("data-msgid");
      } else if (m.id) {
        msgId = m.id.replace(/^message/, "");
      }
      if (msgId) {
        let textElem = m.querySelector(".text");
        let txt = textElem ? textElem.textContent.trim() : "";
        if (txt.length > 0) {
          let snippet = txt.substring(0, 11) + (txt.length > 11 ? "..." : "");
          replyMap[msgId] = snippet;
        }
      }
    });
    return replyMap;
  }
  
  // Здесь создаём глобальную переменную для хранения всех сообщений в виде JSON.
  // Для каждого сообщения будут поля: date, time, unixtime, day_of_week, username (массив), user_id, message_id, reply_id (массив), message_text, message_files (массив).
  window.allMessagesJson = [];

  // Update module interface and re-run parsing
  function updateTelegramInterface() {
    if (selectedFileName === "") {
      dropText.textContent = translations[currentLanguage].dropText;
    } else {
      dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
    }
    const dateFromInput = document.getElementById("date-from");
    const dateToInput = document.getElementById("date-to");
    if (dateFromInput) dateFromInput.placeholder = translations[currentLanguage].dateFromPlaceholder;
    if (dateToInput) dateToInput.placeholder = translations[currentLanguage].dateToPlaceholder;
    const dateRangeLabelElem = document.getElementById("date-range-label");
    if (dateRangeLabelElem) dateRangeLabelElem.textContent = translations[currentLanguage].dateRangeLabel;
    const searchLabelElem = document.getElementById("search-label");
    if (searchLabelElem) {
      const searchInsideCheckbox = document.getElementById("search-inside");
      if (searchInsideCheckbox && searchInsideCheckbox.checked) {
         searchLabelElem.textContent = translations[currentLanguage].searchLabelAnywhere;
      } else {
         searchLabelElem.textContent = translations[currentLanguage].searchLabelBegin;
      }
    }
    if (titleElem) titleElem.textContent = translations[currentLanguage].title;
    if (descriptionElem) descriptionElem.textContent = translations[currentLanguage].description;
    const telegramParams = document.getElementById("telegram-parameters");
    if (telegramParams) {
      const searchInsideLabel = telegramParams.querySelector('label[for="search-inside"]');
      if (searchInsideLabel) searchInsideLabel.textContent = translations[currentLanguage].searchInsideLabel;
      const showAuthorLabel = telegramParams.querySelector('label[for="show-author"]');
      if (showAuthorLabel) showAuthorLabel.textContent = translations[currentLanguage].showAuthorLabel;
      const filterAuthorLabel = telegramParams.querySelector('label[for="filter-author"]');
      if (filterAuthorLabel) filterAuthorLabel.textContent = translations[currentLanguage].filterAuthorLabel;
      const filterUserIdLabel = telegramParams.querySelector('label[for="filter-userid"]');
      if (filterUserIdLabel) filterUserIdLabel.textContent = translations[currentLanguage].filterUserIdLabel;
      const messageIdCheckboxLabel = telegramParams.querySelector('label[for="message-id-checkbox"]');
      if (messageIdCheckboxLabel) messageIdCheckboxLabel.textContent = translations[currentLanguage].messageIdCheckboxLabel;
      const dateRangeLabel = telegramParams.querySelector('label[for="date-range-checkbox"]');
      if (dateRangeLabel) dateRangeLabel.textContent = translations[currentLanguage].dateRangeLabel;
      const filterAuthorInput = document.getElementById("filter-author-input");
      if (filterAuthorInput) filterAuthorInput.placeholder = translations[currentLanguage].filterAuthorInputPlaceholder;
      const filterUserIdInput = document.getElementById("filter-userid-input");
      if (filterUserIdInput) filterUserIdInput.placeholder = translations[currentLanguage].filterUserIdInputPlaceholder;
    }
    if (cachedTelegramData) { refreshParsedResults(); }
  }
  window.updateTelegramInterface = updateTelegramInterface;
  
  // Set up event listeners for filters
  const filterAuthorCheckbox = document.getElementById("filter-author");
  const filterAuthorContainer = document.getElementById("filter-author-container");
  const filterAuthorInput = document.getElementById("filter-author-input");
  if (filterAuthorCheckbox) {
    filterAuthorCheckbox.addEventListener("change", function(){
      filterAuthorContainer.style.display = this.checked ? "block" : "none";
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
  }
  if (filterAuthorInput) {
    filterAuthorInput.addEventListener("input", function(){
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
  }
  const filterUserIdCheckbox = document.getElementById("filter-userid");
  const filterUserIdContainer = document.getElementById("filter-userid-container");
  const filterUserIdInput = document.getElementById("filter-userid-input");
  if (filterUserIdCheckbox) {
    filterUserIdCheckbox.addEventListener("change", function(){
      filterUserIdContainer.style.display = this.checked ? "block" : "none";
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
  }
  if (filterUserIdInput) {
    filterUserIdInput.addEventListener("input", function(){
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
  }
  const messageIdCheckbox = document.getElementById("message-id-checkbox");
  if (messageIdCheckbox) {
    messageIdCheckbox.addEventListener("change", function(){
      if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    });
  }
  
  // Variables for file handling and parsing
  let cachedTelegramData = null;
  let currentFileReader = null;
  let isCanceled = false;
  let filteredText = "";
  let generatedFileName = "notes.txt";
  
  // Refresh parsing results
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
  
  // Process JSON export
  function processJSON(jsonData) {
    console.log("Telegram processJSON called");
    const messagesArray = jsonData.messages || [];
    
    // Сбор данных для allMessagesJson – для каждого сообщения собираем необходимые поля
    window.allMessagesJson = [];
    messagesArray.forEach(msg => {
      let dateObj = null;
      if (msg.date) {
        dateObj = parseDate(msg.date);
      } else if (msg.date_unixtime) {
        dateObj = new Date(msg.date_unixtime * 1000);
      }
      let dateField = dateObj ? dateObj.toLocaleDateString("en-CA") : "";
      let timeField = dateObj ? dateObj.toLocaleTimeString("en-GB", { hour12: false }) : "";
      let unixtimeField = dateObj ? dateObj.getTime() : null;
      let dayOfWeekField = dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "long" }) : "";
      let usernameField = msg.from ? [msg.from] : [];
      let userIdField = msg.from_id || "";
      let messageIdField = msg.id;
      let replyIdField = [];
      if (msg.reply_to_message_id) {
        replyIdField.push(msg.reply_to_message_id);
      }
      let messageTextField = "";
      if (typeof msg.text === "string") {
        messageTextField = msg.text;
      } else if (Array.isArray(msg.text)) {
        messageTextField = msg.text.map(part => (typeof part === "string" ? part : part.text)).join("");
      }
      let messageFilesField = [];
      if (msg.photo) {
        messageFilesField.push(extractFileName(msg.photo));
      }
      if (msg.file) {
        messageFilesField.push(extractFileName(msg.file));
      }
      window.allMessagesJson.push({
        date: dateField,
        time: timeField,
        unixtime: unixtimeField,
        day_of_week: dayOfWeekField,
        username: usernameField,
        user_id: userIdField,
        message_id: messageIdField,
        reply_id: replyIdField,
        message_text: messageTextField,
        message_files: messageFilesField
      });
    });
  
    // Выводим в консоль всю собранную информацию для тестирования
    console.log("allMessagesJson:", window.allMessagesJson);
  
    // Далее стандартная логика фильтрации и формирования вывода
    const replyMap = buildReplyMapJSON(messagesArray);
    const currentLang = currentLanguage;
    const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
    const searchWord = searchWordInput.value.trim().toLowerCase();
    const searchInside = document.getElementById("search-inside").checked;
    const showAuthor = document.getElementById("show-author").checked;
    
    let filterAuthors = [];
    if (document.getElementById("filter-author").checked) {
      filterAuthors = filterAuthorInput.value.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
    }
    let filterUserIds = [];
    if (document.getElementById("filter-userid").checked) {
      filterUserIds = filterUserIdInput.value.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
    }
  
    let fromDate = null, toDate = null;
    if (document.getElementById("date-range-checkbox").checked) {
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
      const lowerMsg = messageText.toLowerCase();
      if (searchWord.length > 0) {
        if (searchInside) {
          if (!lowerMsg.includes(searchWord)) return;
        } else {
          if (!lowerMsg.startsWith(searchWord)) return;
        }
      }
      
      const msgAuthor = (msg.from || msg.from_name || "").toLowerCase();
      if (filterAuthors.length > 0) {
        const authorMatch = filterAuthors.some(filter => msgAuthor.indexOf(filter) !== -1);
        if (!authorMatch) return;
      }
      if (filterUserIds.length > 0) {
        let msgUserId = (msg.from_id || "").toString().toLowerCase();
        const userMatch = filterUserIds.some(filter => msgUserId.indexOf(filter) !== -1);
        if (!userMatch) return;
      }
  
      let dateObj = null;
      if (msg.origin_server_ts) {
        dateObj = new Date(msg.origin_server_ts);
      } else if (msg.date) {
        dateObj = parseDate(msg.date);
      } else if (msg.date_unixtime) {
        dateObj = new Date(msg.date_unixtime * 1000);
      }
      if (document.getElementById("date-range-checkbox").checked && dateObj) {
        if (fromDate && dateObj < fromDate) return;
        if (toDate && dateObj > toDate) return;
      }
  
      let authorLine = "";
      if (showAuthor) {
        let author = msg.from || msg.from_name || "";
        if (author) {
          authorLine = "\n" + translations[currentLang].authorLabel + author;
          if (msg.from_id) {
            authorLine += " (" + msg.from_id + ")";
          }
        }
      }
      if (document.getElementById("message-id-checkbox").checked) {
        let idInfo = "";
        let msgId = "";
        if (msg.id) {
          msgId = typeof msg.id === "string" ? msg.id.replace(/^message/, "") : msg.id;
        }
        if (msgId) {
          idInfo = "\n" + translations[currentLang].messageIdLabel + " (" + msgId + ")";
        }
        if (msg.reply_to_message_id) {
          let snippet = replyMap[msg.reply_to_message_id] || "";
          idInfo += "\n" + translations[currentLang].replyToLabel + " (" + msg.reply_to_message_id + ") " + (snippet ? "[" + snippet + "]" : "");
        }
        if (showAuthor) {
          authorLine += idInfo;
        } else {
          authorLine = idInfo;
        }
      }
  
      const attachments = [];
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
  
  // Process HTML export
  function processHTML(htmlContent) {
    console.log("Telegram processHTML called");
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const messagesNodes = doc.querySelectorAll(".message");
    // Build reply mapping for HTML messages
    const replyMap = buildReplyMapHTML(messagesNodes);
    const currentLang = currentLanguage;
    const locale = currentLang === "en" ? "en-US" : (currentLang === "ru" ? "ru-RU" : "uk-UA");
    const searchWord = searchWordInput.value.trim().toLowerCase();
    const searchInside = document.getElementById("search-inside").checked;
    const showAuthor = document.getElementById("show-author").checked;
  
    let filterAuthors = [];
    if (document.getElementById("filter-author").checked) {
      filterAuthors = filterAuthorInput.value.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
    }
    let filterUserIds = [];
    if (document.getElementById("filter-userid").checked) {
      filterUserIds = filterUserIdInput.value.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
    }
  
    const results = [];
    const dates = [];
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
  
      let includeMsg = true;
      if (searchWord.length > 0) {
        const lowerText = textForSearch.toLowerCase();
        includeMsg = searchInside ? lowerText.includes(searchWord) : lowerText.startsWith(searchWord);
      }
      if (!includeMsg) return;
  
      // Get author: try .from_name; if missing and message is joined, get from previous messages
      let authorText = "";
      let authorElem = msg.querySelector(".from_name");
      if (authorElem && authorElem.textContent.trim() !== "") {
        authorText = authorElem.textContent.trim();
      } else if (msg.classList.contains("joined")) {
        authorText = getJoinedAuthor(msg);
      }
  
      if (filterAuthors.length > 0) {
        if (authorText.toLowerCase().length === 0 ||
            !filterAuthors.some(filter => authorText.toLowerCase().indexOf(filter) !== -1)) {
          return;
        }
      }
  
      if (filterUserIds.length > 0) {
        let userIdHtml = "";
        if (authorElem && authorElem.getAttribute("data-from-id")) {
           userIdHtml = authorElem.getAttribute("data-from-id").toLowerCase();
        } else if (msg.getAttribute("data-from-id")) {
           userIdHtml = msg.getAttribute("data-from-id").toLowerCase();
        }
        if (!userIdHtml || !filterUserIds.some(filter => userIdHtml.indexOf(filter) !== -1)) {
          return;
        }
      }
  
      let authorLine = "";
      if (showAuthor) {
        if (authorText) {
          authorLine = "\n" + translations[currentLang].authorLabel + authorText;
          let userId = "";
          if (authorElem && authorElem.getAttribute("data-from-id")) {
            userId = authorElem.getAttribute("data-from-id");
          } else if (msg.getAttribute("data-from-id")) {
            userId = msg.getAttribute("data-from-id");
          }
          if (userId) {
            authorLine += " (" + userId + ")";
          }
        }
      }
      if (document.getElementById("message-id-checkbox").checked) {
        let idInfo = "";
        let msgId = "";
        if (msg.hasAttribute("data-msgid")) {
          msgId = msg.getAttribute("data-msgid");
        } else if (msg.id) {
          msgId = msg.id.replace(/^message/, "");
        }
        if (msgId) {
          idInfo = "\n" + translations[currentLang].messageIdLabel + " (" + msgId + ")";
        }
        let replyId = "";
        if (msg.hasAttribute("data-reply-to-msgid")) {
          replyId = msg.getAttribute("data-reply-to-msgid");
        } else {
          const replyElem = msg.querySelector(".reply_to.details");
          if (replyElem) {
            const link = replyElem.querySelector("a");
            if (link) {
              const href = link.getAttribute("href");
              const match = href && href.match(/message(\d+)/);
              if (match) {
                replyId = match[1];
              }
            }
          }
        }
        if (replyId) {
          let snippet = replyMap[replyId] || "";
          idInfo += "\n" + translations[currentLang].replyToLabel + " (" + replyId + ") " + (snippet ? "[" + snippet + "]" : "");
        }
        if (showAuthor) {
          authorLine += idInfo;
        } else {
          authorLine = idInfo;
        }
      }
  
      let attachments = [];
      let photoLink = msg.querySelector("a.media_photo") || msg.querySelector("a.photo_wrap");
      if (photoLink) {
        attachments.push(extractFileName(photoLink.getAttribute("href")));
      }
      let videoLink = msg.querySelector("a.video_file_wrap") || msg.querySelector("a.media_video");
      if (videoLink) {
        attachments.push(extractFileName(videoLink.getAttribute("href")));
      }
      let fileLink = msg.querySelector("a.media_file");
      if (fileLink) {
        attachments.push(extractFileName(fileLink.getAttribute("href")));
      }
      let voiceLink = msg.querySelector("a.media_voice_message");
      if (voiceLink) {
        attachments.push(extractFileName(voiceLink.getAttribute("href")));
      }
      let mediaInfo = attachments.length ? "\n" + attachments.join("\n") : "";
  
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
          if (document.getElementById("date-range-checkbox").checked) {
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
  
      let finalMsg = dateStr ? `${dateStr}${authorLine}\n\n${textForSearch}` : `${textForSearch}${authorLine}`;
      if (mediaInfo) finalMsg += mediaInfo;
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
  
  // File handling
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
      dropText.textContent = translations[currentLanguage].fileSelected + selectedFileName;
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
  
  // File input change event
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
  
  // Drop area events
  const dropArea = document.getElementById("drop-area");
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
  document.getElementById("search-inside").addEventListener("change", function () {
    if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
    updateTelegramInterface();
  });
  document.getElementById("show-author").addEventListener("change", function () {
    if (cachedTelegramData && currentExportType === "telegram") refreshParsedResults();
  });
  document.getElementById("date-range-checkbox").addEventListener("change", function () {
    const dateRangeFields = document.getElementById("date-range-fields");
    dateRangeFields.style.display = this.checked ? "block" : "none";
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
  
  // Theme toggle event using the pattern from whatsapp.js
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
  
  // Add event listeners for language radio buttons
  document.querySelectorAll('input[name="language"]').forEach(radio => {
    radio.addEventListener("change", updateTelegramInterface);
    radio.addEventListener("click", updateTelegramInterface);
  });
  
  // Initial update of module interface
  updateTelegramInterface();
})();
