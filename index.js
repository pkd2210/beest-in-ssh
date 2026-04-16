const { Server } = require('ssh2');
const fs = require('fs');

function readLine(stream, promptText, maskInput = false) {
  return new Promise((resolve) => {
    let buffer = '';
    stream.write(promptText);

    const onData = (data) => {
      const text = data.toString('utf8');

      // if user ctrl c then exit
      if (text.includes('\u0003')) {
        stream.write('^C\r\n');
        stream.end();
        return;
      }

      for (const ch of text) {
        if (ch === '\r' || ch === '\n') {
          stream.write('\r\n');
          stream.removeListener('data', onData);
          resolve(buffer.trim());
          return;
        }

        if (ch === '\u0003') {
          stream.write('^C\r\n');
          stream.end();
          return;
        }

        if (ch === '\u007f' || ch === '\b') {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            stream.write(maskInput ? '\b \b' : '\b \b');
          }
          continue;
        }

        buffer += ch;
        stream.write(maskInput ? '*' : ch);
      }
    };

    stream.on('data', onData);
  });
}

module.exports.readLine = readLine;

// import all the commands
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.name] = command;
}



const sshServer = new Server({
    hostKeys: [fs.readFileSync('host.key')]
}, (client) => {
  console.log('Client connected!');
  client.on('authentication', (ctx) => {
      ctx.accept();
  }).on('ready', () => {
    console.log('Client authenticated!');
  }).on('end', () => {
    console.log('Client disconnected');
  });

  client.on('session', (accept) => {
    const session = accept();

    // Accept terminal allocation requests so OpenSSH clients can open an interactive shell cleanly.
    session.on('pty', (accept) => {
      accept();
    });

    session.on('shell', async (accept) => {
        const stream = accept();
        // Define user variables here
        let refreshToken = null;
        let auth_token = null;

        // Login
        stream.write('Welcome to the beest.hackclub.com! (Beest CLI)\r\n');
        await promptAuthKey();
        // Console

        if (isAuthenticated(auth_token, refreshToken)) {
            await startConsole();
        }

        // functions
        async function promptAuthKey() {
        refreshToken = await readLine(stream, '\r\nPlease enter your refresh_token: ', true);
        auth_token = await readLine(stream, '\r\nPlease enter your auth_token: ', true);

        await isAuthenticated(auth_token, refreshToken);
      }

      async function startConsole() {
        stream.write('\r\nYou can now use the beest CLI. Type "help" for a list of commands.\r\n');
        while (true) {
          const command = await readLine(stream, '> ');
            if (command.trim() === '') continue;
            if (commands[command]) {
                commands[command].execute(stream, auth_token, refreshToken);
            } else {
                stream.write(`\r\nCommand not found: ${command}\r\n`);
            }
        }
      }

        async function isAuthenticated(auth_token, refreshToken) {
            // Make a request to https://beest.hackclub.com/api/shop/pipes with the provided tokens to check if they are valid
            const response = await fetch('https://beest.hackclub.com/api/shop/pipes', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
            });
            if (response.status === 200) {
                return true;
            } else {
                stream.write('\r\nAuthentication failed. Please check your tokens and try again.\r\n');
                return false;
            }
        }
        // End of stream
    });
  });
});

sshServer.listen(2222, 'localhost', () => {
  console.log('Public SSH server running on port 2222');
});