module.exports = {
    launch: {
      headless: false,
      slowMo: 50,
      devtools: true,
    },
    browserContext: "incognito",
    server: {
      command: 'node -e "console.log(process.cwd())" > cwd.log && npx http-server src -p 3200 --index index.html > server.log 2>&1',
      port: 3200,
      launchTimeout: 10000
      //cwd: 'chat-export-parser'
    },
  };
  