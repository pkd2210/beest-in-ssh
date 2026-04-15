const { Server } = require('ssh2');
const fs = require('fs');

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

    session.on('shell', (accept) => {
        const stream = accept();
        // Define user variables here
        let refreshToken = null;
        let auth_token = null;

        // Actuall code:
        stream.write('Welcome to the beest.hackclub.com!\r\n');
      promptAuthKey();

        // functions
        async function promptAuthKey() {
        refreshToken = await readLine('\r\nPlease enter your refresh_token: ', true);
        auth_token = await readLine('\r\nPlease enter your auth_token: ', true);

        await isAuthenticated(auth_token, refreshToken);
      }

      function readLine(promptText, maskInput = false) {
        return new Promise((resolve) => {
          let buffer = '';
          stream.write(promptText);

          const onData = (data) => {
            const text = data.toString('utf8');

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

        async function isAuthenticated(auth_token, refreshToken) {
            // Make a request to https://beest.hackclub.com/api/shop/pipes with the provided tokens to check if they are valid
            const response = await fetch('https://beest.hackclub.com/api/shop/pipes', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
            });
            if (response.status === 200) {
                stream.write('\r\nAuthentication successful! You can now use the beest CLI.\r\n');
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