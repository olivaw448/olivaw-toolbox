Architecture:

+------------------------------------------------------+
|                     index.html                       |
|                  (basic/schema UI)                   |
|                                                      |
|   ┌────────────┐   ┌────────────┐   ┌────────────┐   |
|   │ script1.js │   │ script2.js │   │ scriptN.js │   |
|   └────────────┘   └────────────┘   └────────────┘   |
|                                                      |
└──────────────────────────────────────────────────────┘

Explanation:
- index.html is the main file, the container for the interface.
- Adding new JS files is simple: you create a file and add a call button inside the main `index.html`.
- JS file must contains html elements required for configuration/works.

This architecture allows you to easily scale the interface by adding new JavaScript files without changing the overall structure.

Idea for future: create second index.html for PC view with left side settings and right for output.

---

## analytic.js

- frequency of writing messages
- user activity: days of the week, hours of the day
- on which days of the month was active and not
- frequency of using words
- graph of communication between users + clicking on edges and receiving messages
- frequency of using each emoticon

---

For tests:
```npm install --save-dev jest puppeteer jest-puppeteer
npm install --save-dev http-server

#or just:
npm install
npm test```