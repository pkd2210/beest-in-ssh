module.exports = {
    name: 'pipes',
    description: 'Get your current pipes amount.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/shop/pipes', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        });
        if (response.status === 200) {
            const data = await response.json();
            stream.write(`\r\nYou currently have ${data.pipes} pipes.\r\n`);
            return;
        } else {
            stream.write('\r\nFailed to fetch pipes. Please try again later.\r\n');
            return;
        }
    }
};