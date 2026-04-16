module.exports = {
    'name': 'leaderboard',
    'description': 'Show the leaderboard of users with the most hours.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/leaderboard', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        });
        if (response.status === 200) {
            const data = await response.json();
            const entries = Array.isArray(data) ? data : data.leaderboard;

            if (!Array.isArray(entries) || entries.length === 0) {
                stream.write('\r\nLeaderboard is currently empty.\r\n');
                return;
            }

            stream.write('\r\nLeaderboard:\r\n');
            entries.forEach((user, index) => {
                stream.write(`  ${index + 1}. ${user.name} - ${user.hours} hours\r\n`);
            });

            if (data && typeof data.totalUsers === 'number') {
                stream.write(`\r\nTotal users: ${data.totalUsers}\r\n`);
            }
        } else {
            stream.write('\r\nFailed to fetch leaderboard. Please try again later.\r\n');
        }
    }
};