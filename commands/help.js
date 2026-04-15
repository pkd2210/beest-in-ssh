// This file is for the "help" command, which will show a list of all available commands and their descriptions.
const fs = require('fs');

const commands = {};
const commandFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'help.js');
for (const file of commandFiles) {
    const command = require(`./${file}`);
    commands[command.name] = command;
}

module.exports = {
    name: 'help',
    description: 'Show a list of all available commands and their descriptions.',
    execute(stream) {
        stream.write('\r\nAvailable commands:\r\n');
        for (const commandName in commands) {
            const command = commands[commandName];
            stream.write(`  ${command.name} - ${command.description}\r\n`);
        }
    }
};