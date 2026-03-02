const baseUrl = 'http://localhost:3000';

async function testFlow() {
    console.log('1. Registering user via Web...');
    const phone = '+910000000009';
    const email = 'testuser9@example.com';

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email, phone, password: 'password123' })
    });
    console.log('Register Response:', regRes.status, await regRes.text());

    console.log('\n2. Testing DASHBOARD command for user with password...');
    const waRes1 = await fetch(`${baseUrl}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: phone,
                            text: { body: 'DASHBOARD' }
                        }]
                    }
                }]
            }]
        })
    });
    console.log('Dashboard Response (Expected: Already have access):', waRes1.status, await waRes1.text());

    console.log('\n3. Testing DASHBOARD command for dummy WhatsApp user (no password)...');
    const dummyPhone = '+910000000002';

    // Create a session to simulate starting bot
    await fetch(`${baseUrl}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            entry: [{ changes: [{ value: { messages: [{ from: dummyPhone, text: { body: 'HELLO' } }] } }] }]
        })
    });

    const waRes2 = await fetch(`${baseUrl}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: dummyPhone,
                            text: { body: 'DASHBOARD' }
                        }]
                    }
                }]
            }]
        })
    });
    console.log('Dashboard Response (Expected: Magic Link generation):', waRes2.status, await waRes2.text());
}

testFlow().catch(console.error);
