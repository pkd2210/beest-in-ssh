module.exports = {
    name: 'news',
    description: 'Show the latest news from the orgs.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/news', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        });
        if (response.status === 200) {
            const data = await response.json();
            if (data.length === 0) {
                stream.write('\r\nNo news available at the moment.\r\n');
                return;
            }
            stream.write('\r\nLatest News:\r\n');
            data.forEach((newsItem, index) => {
                stream.write(`  ${index + 1}. - ${newsItem.displayDate}\r\n`);
                stream.write(`     ${newsItem.text}\r\n`);
            });
        } else {
            stream.write('\r\nFailed to fetch news. Please try again later.\r\n'); 
        }
    }
};