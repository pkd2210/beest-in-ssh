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
        let authCookie = '';
        // Actuall code:
        stream.write('Welcome to the beest.hackclub.com!\r\n');
            promptAuthKey();


        // functions
        async function promptAuthKey() {
          stream.write('\r\nPlease enter auth token: ');
            let tempAuthKey = '';
            stream.on('data', async (data) => {
                if (data.toString().trim() === '') {
                    const authenticated = await isAuthenticated(tempAuthKey);
                    if (authenticated) {
                        stream.write('\r\nAuthentication successful! Access granted.\r\n');
                    } else {
                        stream.write('\r\nAuthentication failed! Please try again.\r\n');
                        tempAuthKey = '';
                      stream.write('\r\nPlease enter auth token: ');
                        return;
                    }
                } else {
                stream.write(data.toString());
                tempAuthKey += data.toString().trim();
                  console.log('Received auth input:', tempAuthKey);
                }
            });
            
        }

        async function isAuthenticated(authKey) {
            console.log('authKey to check:', authKey);
            const response = await fetch('https://beest.hackclub.com/api/shop/pipes', {
                headers: {
                    'Cookie': `auth_token=${authKey}`,
                    'auth_token': authKey
                }
            });
            console.log('response: ', response);
            return response.status === 200;
        }

        // End of stream
    });
  });
});

sshServer.listen(2222, 'localhost', () => {
  console.log('Public SSH server running on port 2222');
});