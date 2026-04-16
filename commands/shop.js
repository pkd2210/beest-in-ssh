module.exports = {
    name: 'shop',
    description: 'List all shop items.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/shop', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        })
        if (response.status === 200) {
            const data = await response.json();
            stream.write('\r\nAvailable shop items:\r\n');
            data.forEach((item, index) => {
                const description = item.description.replace(/\n/g, ' ');
                stream.write(`  ${index + 1}. ${item.name} - ${description} - ${item.priceHours} pipes ${item.stock != null ? `- Stock: ${item.stock}` : ''}\r\n`);
            });
        } else {
            stream.write('\r\nFailed to fetch shop items. Please try again later.\r\n');
        }
    }
}