(function initAnalyticModule() {
    // Always run analytic module
    console.log("Analytic module activated");
  
    const showAuthorCheckbox = document.getElementById("show-author");
    if (showAuthorCheckbox) showAuthorCheckbox.checked = true;
    const messageIdCheckbox = document.getElementById("message-id-checkbox");
    if (messageIdCheckbox) messageIdCheckbox.checked = true;
  
    document.querySelectorAll("#export-type-bar button").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.type !== "analytic") {
          const anDiv = document.getElementById("analytic");
          if (anDiv) {
            anDiv.innerHTML = "";
            anDiv.style.display = "none";
          }
        }
      });
    });
  
    const translations = {
      en: {
        title: "Chat Analytics",
        description: "Analyze messages from the Telegram JSON export.",
        dateRangeLabel: "Date range",
        dateFromPlaceholder: "From",
        dateToPlaceholder: "To",
        btnUpdate: "Update analytics",
        userActivityTitle: "User Activity Analysis",
        daysTitle: "Days",
        timeTitle: "Time",
        topWordsTitle: "Top Words",
        topWordsMinLength: "Min word length",
        topWordsMaxLength: "Max word length",
        mediaTitle: "Media Usage",
        mediaByUserTitle: "Media by User",
        userGraphTitle: "User Graph",
        userGraphDesc: "Visualization of user interactions",
        emojiStatsTitle: "Emoji Usage (by user)",
        noMessages: "No messages found (after filters).",
        authorLabel: "Author",
        messageLabel: "Message",
        weekdayHeaders: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      ru: {
        title: "Аналитика Чата",
        description: "Анализ сообщений из JSON экспорта Telegram.",
        dateRangeLabel: "Диапазон дат",
        dateFromPlaceholder: "От",
        dateToPlaceholder: "До",
        btnUpdate: "Обновить аналитику",
        userActivityTitle: "Анализ активности пользователей",
        daysTitle: "Дни недели",
        timeTitle: "Анализ по часам",
        topWordsTitle: "Популярные слова",
        topWordsMinLength: "Мин. длина слова",
        topWordsMaxLength: "Макс. длина слова",
        mediaTitle: "Использование медиа",
        mediaByUserTitle: "Медиа по пользователям",
        userGraphTitle: "Граф пользователей",
        userGraphDesc: "Визуализация переписки между пользователями",
        emojiStatsTitle: "Статистика смайликов (по пользователям)",
        noMessages: "Сообщений не найдено (с учетом фильтров).",
        authorLabel: "Автор",
        messageLabel: "Сообщение",
        weekdayHeaders: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
      },
      ua: {
        title: "Аналітика чату",
        description: "Аналіз повідомлень з JSON експорту Telegram.",
        dateRangeLabel: "Діапазон дат",
        dateFromPlaceholder: "Від",
        dateToPlaceholder: "До",
        btnUpdate: "Оновити аналітику",
        userActivityTitle: "Аналіз активності користувачів",
        daysTitle: "Дні тижня",
        timeTitle: "Аналіз за годинами",
        topWordsTitle: "Популярні слова",
        topWordsMinLength: "Мін. довжина слова",
        topWordsMaxLength: "Макс. довжина слова",
        mediaTitle: "Використання медіа",
        mediaByUserTitle: "Медіа по користувачах",
        userGraphTitle: "Граф користувачів",
        userGraphDesc: "Візуалізація переписки між користувачами",
        emojiStatsTitle: "Статистика емодзі (по користувачах)",
        noMessages: "Повідомлень не знайдено (з урахуванням фільтрів).",
        authorLabel: "Автор",
        messageLabel: "Повідомлення",
        weekdayHeaders: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
      }
    };
    const currentLang = window.currentLanguage || "en";
    const t = translations[currentLang] || translations.en;
  
    // Updated HTML: move all contact info into a new section in the User Graph block
    const analyticDiv = document.getElementById("analytic");
    analyticDiv.style.display = "block";
    analyticDiv.innerHTML = `
      <div style="margin:0 auto; max-width:900px; text-align:left; font-size:14px; line-height:1.2;">
        <h2 style="text-align:center; margin:0.2em 0;">${t.title}</h2>
        <p style="text-align:center; margin:0.2em 0 0.5em 0;">${t.description}</p>
    
        <div style="display:flex; align-items:center; justify-content:center; gap:0.3em; margin-bottom:0.3em;">
          <label>${t.dateRangeLabel}:</label>
          <input type="date" id="analytic-date-from" placeholder="${t.dateFromPlaceholder}" style="margin:0 0.2em;"/>
          <input type="date" id="analytic-date-to" placeholder="${t.dateToPlaceholder}" style="margin:0 0.2em;"/>
          <button id="analytic-update-btn" style="margin:0 0.2em;">${t.btnUpdate}</button>
        </div>
    
        <h3 style="margin:0.3em 0;">${t.userActivityTitle}</h3>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:0.5em; margin-bottom:0.3em;">
          <div style="flex:1; min-width:200px; text-align:center;">
            <div style="font-weight:bold; margin-bottom:0.2em;">${t.daysTitle}</div>
            <div id="analytic-user-activity-days"></div>
          </div>
          <div style="flex:2; min-width:300px; text-align:center;">
            <div style="font-weight:bold; margin-bottom:0.2em;">${t.timeTitle}</div>
            <div style="display:flex; justify-content:center; gap:1em;">
              <div id="time-col-left"></div>
              <div id="time-col-right"></div>
            </div>
          </div>
        </div>
    
        <h3 style="margin:0.3em 0;">${t.topWordsTitle}</h3>
        <div style="display:flex; align-items:center; gap:0.3em; margin-bottom:0.3em;">
          <label>${t.topWordsMinLength}:</label>
          <input type="number" id="top-words-minlen" value="3" style="width:50px;"/>
          <label>${t.topWordsMaxLength}:</label>
          <input type="number" id="top-words-maxlen" value="15" style="width:50px;"/>
        </div>
        <div id="analytic-top-words-result" style="max-width:100%; max-height:200px; overflow:auto; border:1px solid #666; padding:4px; margin-bottom:0.3em; white-space:normal;"></div>
    
        <h3 style="margin:0.3em 0;">${t.mediaTitle}</h3>
        <div id="analytic-media-result" style="margin-bottom:0.3em;"></div>
    
        <h3 style="margin:0.3em 0;">${t.userGraphTitle}</h3>
        <p style="margin:0.2em 0;">${t.userGraphDesc}</p>
        <div id="analytic-contact-result" style="margin-bottom:0.3em;"></div>
        <div id="analytic-user-graph-canvas" style="height:300px; border:1px solid #666; margin-bottom:0.3em;"></div>
        <div id="edge-messages" style="margin-bottom:0.3em;"></div>
    
        <h3 style="margin:0.3em 0;">${t.emojiStatsTitle}</h3>
        <div id="analytic-emoji-result" style="margin-bottom:0.3em; overflow:auto;"></div>
      </div>
    `;
    
    const dateFromInput = document.getElementById("analytic-date-from");
    const dateToInput = document.getElementById("analytic-date-to");
    const updateBtn = document.getElementById("analytic-update-btn");
    const userActivityDaysDiv = document.getElementById("analytic-user-activity-days");
    const timeColLeftDiv = document.getElementById("time-col-left");
    const timeColRightDiv = document.getElementById("time-col-right");
    const topWordsMinLen = document.getElementById("top-words-minlen");
    const topWordsMaxLen = document.getElementById("top-words-maxlen");
    const topWordsResultDiv = document.getElementById("analytic-top-words-result");
    const mediaResultDiv = document.getElementById("analytic-media-result");
    const contactResultDiv = document.getElementById("analytic-contact-result");
    const userGraphDiv = document.getElementById("analytic-user-graph-canvas");
    const emojiDiv = document.getElementById("analytic-emoji-result");
    
    function parseMessagesFromJson() {
      if (!window.allMessagesJson || !Array.isArray(window.allMessagesJson)) return [];
      return window.allMessagesJson.map(m => {
        let dateObj = null;
        if (m.date && m.time) {
          dateObj = new Date(m.date + "T" + m.time);
        }
        return {
          dateObj: dateObj,
          dateString: m.date,
          timeString: m.time,
          unixtime: m.unixtime,
          weekdayString: m.day_of_week,
          sender: m.username && m.username.length > 0 ? m.username.join(", ") : "",
          userId: m.user_id,
          messageId: m.message_id,
          replyToId: m.reply_id && m.reply_id.length > 0 ? m.reply_id[0] : "",
          text: m.message_text,
          files: m.message_files
        };
      });
    }
    
    function filterMessagesByDate(msgs, fromDate, toDate) {
      if (!fromDate && !toDate) return msgs;
      return msgs.filter(m => {
        if (!m.dateObj) return false;
        if (fromDate && m.dateObj < fromDate) return false;
        if (toDate && m.dateObj > toDate) return false;
        return true;
      });
    }
    
    function analyzeUserActivity(msgs) {
      let hourCount = {};
      let weekdayCount = {};
      for (let i = 0; i < 24; i++) hourCount[i] = 0;
      for (let i = 0; i < 7; i++) weekdayCount[i] = 0;
      msgs.forEach(m => {
        if (!m.dateObj) return;
        let h = m.dateObj.getHours();
        let wd = m.dateObj.getDay();
        hourCount[h]++;
        weekdayCount[wd]++;
      });
      return { hourCount, weekdayCount };
    }
    
    function analyzeTopWords(msgs, minLen, maxLen) {
      const freq = {};
      const wordRegex = /[a-zA-Zа-яА-ЯёЁїієґҐ0-9]+/ug;
      msgs.forEach(m => {
        let txt = m.text.toLowerCase();
        txt = txt.replace(/\bhttps?:\/\/\S+/g, " ").replace(/\bphoto\S+/g, " ");
        let words = txt.match(wordRegex);
        if (!words) return;
        words.forEach(w => {
          if (w.length < minLen || w.length > maxLen) return;
          freq[w] = (freq[w] || 0) + 1;
        });
      });
      let arr = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      return arr.slice(0, 200);
    }
    
    function analyzeMediaUsage(msgs) {
      let mediaRows = [];
      msgs.forEach(m => {
        if (m.files && m.files.length > 0) {
          let time = m.timeString || (m.dateObj ? m.dateObj.toLocaleTimeString() : "");
          m.files.forEach(fileName => {
            mediaRows.push({
              messageId: m.messageId,
              sender: m.sender,
              time: time,
              file: fileName
            });
          });
        }
      });
      return mediaRows;
    }
    
    function analyzeUserRelations(msgs) {
      let counts = {};
      msgs.forEach(m => {
        let s = m.sender || "Unknown";
        counts[s] = (counts[s] || 0) + 1;
      });
      return counts;
    }
    
    function buildConversations(msgs) {
      let conversations = {};
      let msgById = {};
      msgs.forEach(m => {
        if (m.messageId) msgById[m.messageId] = m;
      });
      msgs.forEach(m => {
        if (m.replyToId) {
          let original = msgById[m.replyToId];
          if (original) {
            let key = original.sender + " -> " + m.sender;
            if (!conversations[key]) conversations[key] = [];
            conversations[key].push(`${m.dateString} ${m.timeString}\nFrom: ${m.sender} (user_id: ${m.userId})\nTo: ${original.sender} (user_id: ${original.userId})\nMessage: ${m.text}`);
          }
        }
      });
      let html = "";
      for (let key in conversations) {
        let transcript = conversations[key].join("\n\n-----------------------------------\n\n");
        html += wrapInSpoiler(transcript, key);
      }
      return html;
    }
    
    function wrapInSpoiler(htmlContent, summaryText) {
      return `<details style="margin:0.2em 0;">
        <summary style="cursor:pointer;color:#0077cc;">${summaryText}</summary>
        <div style="padding:0.2em 0.5em; white-space:pre-wrap;">${htmlContent}</div>
      </details>`;
    }
    
    function buildUserGraph(msgs) {
      const nodesMap = {};
      const edgesMap = {};
      const allMsgs = msgs || parseMessagesFromJson();
      const msgById = {};
      allMsgs.forEach(m => {
        if (m.messageId) msgById[m.messageId] = m;
        if (m.sender) nodesMap[m.sender] = { id: m.sender, label: m.sender };
      });
      allMsgs.forEach(m => {
        if (m.replyToId && msgById[m.replyToId]) {
          const target = msgById[m.replyToId].sender;
          const source = m.sender;
          if (source && target) {
            let key = source + "->" + target;
            edgesMap[key] = (edgesMap[key] || 0) + 1;
          }
        }
      });
      const nodes = new vis.DataSet(Object.values(nodesMap));
      const edgesArray = Object.keys(edgesMap).map(key => {
        const [from, to] = key.split("->");
        return { id: key, from, to, label: edgesMap[key].toString(), arrows: "to" };
      });
      const edges = new vis.DataSet(edgesArray);
      const options = {
        layout: { randomSeed: 2 },
        physics: { stabilization: true },
        edges: { smooth: true }
      };
      const network = new vis.Network(userGraphDiv, { nodes, edges }, options);
      network.on("click", function (params) {
        const edgeMessagesDiv = document.getElementById("edge-messages");
        if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const clickedEdge = edges.get(edgeId);
          if (clickedEdge) {
            const from = clickedEdge.from;
            const to = clickedEdge.to;
            let relatedMessages = [];
            allMsgs.forEach(m => {
              if (m.replyToId && msgById[m.replyToId]) {
                if (msgById[m.replyToId].sender === from && m.sender === to) {
                  relatedMessages.push(`${m.dateString} ${m.timeString}\nFrom: ${m.sender} (user_id: ${m.userId})\nTo: ${msgById[m.replyToId].sender} (user_id: ${msgById[m.replyToId].userId})\nMessage: ${m.text}`);
                }
              }
            });
            if (relatedMessages.length > 0) {
              edgeMessagesDiv.innerHTML = `<div style="padding:5px; border:1px solid #ccc;">${relatedMessages.join("<br/><br/>")}</div>`;
            } else {
              edgeMessagesDiv.innerHTML = "No messages for this edge.";
            }
          }
        } else {
          edgeMessagesDiv.innerHTML = "";
        }
      });
    }
    
    function loadVisJs(callback) {
      if (window.vis) {
        callback();
        return;
      }
      let script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js";
      script.onload = callback;
      document.body.appendChild(script);
    }
    
    function analyzeEmojiUsagePerUser(msgs) {
      const emoRegex = /[\p{Extended_Pictographic}]/u;
      let usage = {};
      msgs.forEach(m => {
        if (!m.sender) return;
        if (!usage[m.sender]) usage[m.sender] = {};
        for (let ch of m.text) {
          if (emoRegex.test(ch)) {
            usage[m.sender][ch] = (usage[m.sender][ch] || 0) + 1;
          }
        }
      });
      return usage;
    }
    
    function buildEmojiUsageTable(usageData) {
      let html = `<table style="border-collapse:collapse; margin:0 auto;"><tr>
        <th style="border:1px solid #999; padding:2px 4px;">User</th>
        <th style="border:1px solid #999; padding:2px 4px;">Emoji Usage</th>
      </tr>`;
      for (let user in usageData) {
        let statsArr = Object.entries(usageData[user]).sort((a, b) => b[1] - a[1]);
        let statsStr = statsArr.map(([emoji, count]) => `${emoji}:${count}`).join(", ");
        html += `<tr>
          <td style="border:1px solid #999; padding:2px 4px;">${user}</td>
          <td style="border:1px solid #999; padding:2px 4px;">${statsStr}</td>
        </tr>`;
      }
      html += `</table>`;
      return html;
    }
    
    function updateAnalytics() {
      let allMsgs = parseMessagesFromJson();
      if (!allMsgs.length) {
        topWordsResultDiv.innerHTML = `<span style="color:red">${t.noMessages}</span>`;
        return;
      }
      let fromDate = null, toDate = null;
      if (dateFromInput.value) fromDate = new Date(dateFromInput.value);
      if (dateToInput.value) {
        toDate = new Date(dateToInput.value);
        toDate.setHours(23, 59, 59, 999);
      }
      let msgs = filterMessagesByDate(allMsgs, fromDate, toDate);
      if (!msgs.length) {
        userActivityDaysDiv.innerHTML = "";
        timeColLeftDiv.innerHTML = "";
        timeColRightDiv.innerHTML = "";
        topWordsResultDiv.innerHTML = `<span style="color:red">${t.noMessages}</span>`;
        mediaResultDiv.innerHTML = "";
        document.getElementById("analytic-contact-result").innerHTML = "";
        userGraphDiv.innerHTML = "";
        document.getElementById("edge-messages").innerHTML = "";
        emojiDiv.innerHTML = "";
        return;
      }
      const act = analyzeUserActivity(msgs);
      const weekOrder = [1, 2, 3, 4, 5, 6, 0];
      let dayRow = `<table style="border-collapse:collapse; margin:0 auto;"><tr>`;
      weekOrder.forEach(i => {
        dayRow += `<th style="border:1px solid #999; padding:2px 4px;">${t.weekdayHeaders[i]}</th>`;
      });
      dayRow += `</tr><tr>`;
      weekOrder.forEach(i => {
        dayRow += `<td style="border:1px solid #999; padding:2px 4px; text-align:center;">${act.weekdayCount[i] || 0}</td>`;
      });
      dayRow += `</tr></table>`;
      userActivityDaysDiv.innerHTML = dayRow;
      let leftHtml = `<table style="border-collapse:collapse;">`;
      for (let h = 0; h < 12; h++) {
        let hh = (h < 10 ? "0" + h : h) + ":00";
        leftHtml += `<tr>
          <td style="border:1px solid #999; padding:2px 4px;">${hh}</td>
          <td style="border:1px solid #999; padding:2px 4px; text-align:center;">${act.hourCount[h] || 0}</td>
        </tr>`;
      }
      leftHtml += `</table>`;
      let rightHtml = `<table style="border-collapse:collapse;">`;
      for (let h = 12; h < 24; h++) {
        let hh = (h < 10 ? "0" + h : h) + ":00";
        rightHtml += `<tr>
          <td style="border:1px solid #999; padding:2px 4px;">${hh}</td>
          <td style="border:1px solid #999; padding:2px 4px; text-align:center;">${act.hourCount[h] || 0}</td>
        </tr>`;
      }
      rightHtml += `</table>`;
      timeColLeftDiv.innerHTML = leftHtml;
      timeColRightDiv.innerHTML = rightHtml;
    
      let mn = parseInt(topWordsMinLen.value) || 1;
      let mx = parseInt(topWordsMaxLen.value) || 999;
      let tw = analyzeTopWords(msgs, mn, mx);
      if (!tw.length) {
        topWordsResultDiv.innerHTML = `<i style="color:#666;">(no words found)</i>`;
      } else {
        topWordsResultDiv.innerHTML = tw.map(([w, f]) => `${w} (${f})`).join(", ");
      }
    
      let media = analyzeMediaUsage(msgs);
      let mediaHTML = "";
      if (!media.length) {
        mediaHTML = `<i style="color:#666;">(no media detected)</i>`;
      } else {
        let groups = [];
        for (let i = 0; i < media.length; i += 50) {
          groups.push(media.slice(i, i + 50));
        }
        groups.forEach((group, index) => {
          let mediaTable = `<table style="border-collapse:collapse; margin:0 auto;"><tr>
             <th style="border:1px solid #999; padding:2px 4px;">Message ID</th>
             <th style="border:1px solid #999; padding:2px 4px;">Sender</th>
             <th style="border:1px solid #999; padding:2px 4px;">Time</th>
             <th style="border:1px solid #999; padding:2px 4px;">File Name</th>
          </tr>`;
          group.forEach(row => {
            mediaTable += `<tr>
               <td style="border:1px solid #999; padding:2px 4px;">${row.messageId}</td>
               <td style="border:1px solid #999; padding:2px 4px;">${row.sender}</td>
               <td style="border:1px solid #999; padding:2px 4px;">${row.time}</td>
               <td style="border:1px solid #999; padding:2px 4px;">${row.file}</td>
            </tr>`;
          });
          mediaTable += `</table>`;
          mediaHTML += wrapInSpoiler(mediaTable, `Media Group ${index + 1} (${group.length} items)`);
        });
        let mediaByUser = {};
        media.forEach(row => {
          if (!mediaByUser[row.sender]) mediaByUser[row.sender] = [];
          mediaByUser[row.sender].push(row);
        });
        mediaHTML += `<h4 style="margin:5px 0;">${t.mediaByUserTitle}</h4>`;
        for (let user in mediaByUser) {
          let table = `<table style="border-collapse:collapse; margin:0 auto;"><tr>
             <th style="border:1px solid #999; padding:2px 4px;">Message ID</th>
             <th style="border:1px solid #999; padding:2px 4px;">Time</th>
             <th style="border:1px solid #999; padding:2px 4px;">File Name</th>
          </tr>`;
          mediaByUser[user].forEach(row => {
            table += `<tr>
               <td style="border:1px solid #999; padding:2px 4px;">${row.messageId}</td>
               <td style="border:1px solid #999; padding:2px 4px;">${row.time}</td>
               <td style="border:1px solid #999; padding:2px 4px;">${row.file}</td>
            </tr>`;
          });
          table += `</table>`;
          mediaHTML += wrapInSpoiler(table, user);
        }
      }
      mediaResultDiv.innerHTML = mediaHTML;
    
      let rel = analyzeUserRelations(msgs);
      let relArr = Object.entries(rel).sort((a, b) => b[1] - a[1]);
      let contactHTML = "";
      if (!relArr.length) {
        contactHTML = `<i style="color:#666;">(no user interactions)</i>`;
      } else {
        let relTable = `<table style="border-collapse:collapse; margin:0 auto;"><tr>
            <th style="border:1px solid #999; padding:2px 4px;">User</th>
            <th style="border:1px solid #999; padding:2px 4px;">Messages Count</th>
        </tr>`;
        relArr.forEach(([u, c]) => {
          relTable += `<tr>
               <td style="border:1px solid #999; padding:2px 4px;">${u}</td>
               <td style="border:1px solid #999; padding:2px 4px; text-align:center;">${c}</td>
          </tr>`;
        });
        relTable += `</table>`;
        let conversationsHTML = buildConversations(msgs);
        contactHTML = relTable + "<br/>" + conversationsHTML;
      }
      document.getElementById("analytic-contact-result").innerHTML = wrapInSpoiler(contactHTML, "Contact between users");
    
      loadVisJs(() => {
        buildUserGraph(msgs);
      });
    
      const emojiUsage = analyzeEmojiUsagePerUser(msgs);
      const emojiTableHTML = buildEmojiUsageTable(emojiUsage);
      emojiDiv.innerHTML = emojiTableHTML;
    }
    
    updateBtn.addEventListener("click", updateAnalytics);
    updateAnalytics();
  })();
  