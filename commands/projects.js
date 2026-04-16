module.exports = {
    'name': 'projects',
    'description': 'List all your projects.',
    async execute(stream, auth_token, refreshToken) {
        const response = await fetch('https://beest.hackclub.com/api/projects', {
                method: 'GET',
                headers: {
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                }
        })
        if (response.status === 200) {
            const data = await response.json();
            if (data.length === 0) {
                stream.write('\r\nYou have no projects.\r\n');
                return;
            }
            stream.write('\r\nYour projects:\r\nName - Description - Status \r\n');
            data.forEach(project => {
                const description = project.description.replace(/\n/g, ' ');
                stream.write(`  ${project.name} - ${description} - ${project.status}\r\n`);
            });
        } else {
            stream.write('\r\nFailed to fetch projects. Please try again later.\r\n');
        }
    }
}