# Setup:
1. ```sh-keygen -t rsa -b 2048 -m PEM -f host.key``` - Setup the ssh host.key
2. ```node index.js``` - run the application

# Commands
1. exit - Exit the CLI
2. help - Show a list of all available commands and their descriptions
3. hours - Get your current hours amount
4. leaderboard - Show the leaderboard of users with the most hours
5. news - Show the latest news from the orgs
6. pipes - Get your current pipes amount
7. projects - List all your projects
8. shop - List all shop items

# How to create a command
1. Create a file in the commands folder ```<COMMAND_NAME>.js```
2. In the file, write 
```javascript
module.exports = {
    'name': 'COMMAND_NAME',
    'description': 'COMMAND_DESCRIPTION',
    async execute(stream, auth_token, refreshToken) {
        // Put the command functionality here
    }
}
```
3. Add command to the Commands list in README.md