module.exports = {
    name: 'exit',
    description: 'Exit the CLI.',
    execute(stream) {
        stream.write('\r\nGoodbye!\r\n');
        stream.end();
    }
};