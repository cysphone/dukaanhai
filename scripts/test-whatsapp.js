const fetch = require('node-fetch');

const WEBHOOK_URL = 'http://localhost:3000/api/whatsapp/webhook';
const PHONE_NUMBER = '+919999999999';

async function sendWebhookMessage(text) {
    const payload = {
        entry: [
            {
                changes: [
                    {
                        value: {
                            messages: [
                                {
                                    from: PHONE_NUMBER,
                                    text: { body: text }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    };

    console.log(`\n\n=== Sending: "${text}" ===`);
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const resData = await response.json();
    console.log('Webhook Response:', resData);
    // Give it a bit of time to process
    await new Promise(r => setTimeout(r, 2000));
}

async function runTests() {
    console.log("Starting WhatsApp Simulation...");

    // 1. Send first message to start creation
    await sendWebhookMessage("Hi");

    // 2. Name
    await sendWebhookMessage("My Super Store");

    // 3. Category
    await sendWebhookMessage("Electronics");

    // 4. Location
    await sendWebhookMessage("Delhi");

    // 5. Description
    await sendWebhookMessage("Best electronics shop in town.");

    // 6. Template (triggers creation)
    await sendWebhookMessage("1");

    console.log("Waiting for business creation to complete (10s)...");
    await new Promise(r => setTimeout(r, 10000));

    // 8. Try to say NO to add product
    await sendWebhookMessage("NO");

    // 9. Now we are an existing user. Let's send a random message to get the menu
    await sendWebhookMessage("Hello again");

    // 10. Let's try to create a new site (Option 4)
    await sendWebhookMessage("4");

    // 11. Reset
    await sendWebhookMessage("RESET");

    console.log("Simulation complete. Check the application logs or DB.");
}

runTests();
