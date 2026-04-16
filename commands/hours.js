module.exports = {
    'name': 'hours',
    'description': 'Get your current hours amount.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/projects/hours', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        });
        if (response.status === 200) {
            const data = await response.json();
            stream.write(`\r\nYou currently have ${data.hours} / 40 hours.\r\n`);
            stream.write(`Unshipped Hours: ${data.byStatus.unshipped} hours\r\n`);
            stream.write(`Shipped Hours: ${data.byStatus.shipped || 0} hours\r\n`);
            return;
        } else {
            stream.write('\r\nFailed to fetch hours. Please try again later.\r\n');
            return;
        }
    }
};