
const { readLine } = require('../index');


module.exports = {
    name: 'buy',
    description: 'Buy an item from the shop.',
    async execute(stream, auth_token, refreshToken) {
        let items = {};
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
                items[index + 1] = item;
            });
            stream.write('\r\nEnter the number of the item you want to buy:\r\n');
            const itemNumber = await readLine(stream, '> ');
            const selectedItem = items[itemNumber];
            if (!selectedItem) {
                stream.write('\r\nInvalid item number. Please try again.\r\n');
                return;
            }
            stream.write('\r\nEnter the quantity you want to buy:\r\n');
            const quantity = await readLine(stream, '> ');
            if (isNaN(quantity) || quantity <= 0) {
                stream.write('\r\nInvalid quantity. Please enter a positive number.\r\n');
                return;
            }
            const buyResponse = await fetch('https://beest.hackclub.com/api/shop/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie' : `auth_token=${auth_token}; refresh_token=${refreshToken}`
                },
                body: JSON.stringify({ shopItemId: selectedItem.id,  quantity: parseInt(quantity) })
            })
            if (buyResponse.status === 200) {
                stream.write('\r\nPurchase successful!\r\n');
            } else {
                stream.write('\r\nFailed to purchase item. Please try again later.\r\n');
            }
        } else {
            stream.write('\r\nFailed to fetch shop items. Please try again later.\r\n');
        }
    }
}