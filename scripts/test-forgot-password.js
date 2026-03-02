const baseUrl = 'http://localhost:3000';

async function testForgotPasswordFlow() {
    console.log('1. Testing Forgot Password for a non-existent user...');
    let res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'doesnotexist@example.com' })
    });
    console.log('Response (Expected 200 to prevent enumeration):', res.status);

    console.log('\n2. Testing Forgot Password for an existing user WITH a phone number (should generate Magic Link)...');
    // From our previous test script, this user with "+910000000009" should exist
    res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '+910000000009' })
    });
    console.log('Response (Expected 200 Success):', res.status, await res.text());
}

testForgotPasswordFlow().catch(console.error);
