// The token structure: {UUID}{timestamp}:{secretUUID}
// UUID: 406f72bf-a5f9-42ec-9e62-94dc301d3bcd (36 chars)
// Timestamp appended: 1778556628832
// Secret: 08a494b7-548f-4251-8c9d-5f25573f3acc

const FULL_TOKEN = '406f72bf-a5f9-42ec-9e62-94dc301d3bcd1778556628832:08a494b7-548f-4251-8c9d-5f25573f3acc';
const UUID_PART = '406f72bf-a5f9-42ec-9e62-94dc301d3bcd'; // Just the UUID (36 chars)
const SECRET = '08a494b7-548f-4251-8c9d-5f25573f3acc';

const payload = {
  fields: { name: 'Test', phone_number: '919027560023', email: 'test@aharada.in' }
};

async function test(label, url, headers = {}) {
  console.log(`\n--- ${label}`);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    console.log('Status:', r.status, '| Response:', text.slice(0, 300));
  } catch(e) { console.error('Error:', e.message); }
}

(async () => {
  // Try 1: Just UUID in URL (without timestamp part)
  await test('UUID only in URL',
    `https://app.telecrm.in/api/b1/enterprise/${UUID_PART}/autoupdatelead`);

  // Try 2: UUID in URL + full token as Bearer
  await test('UUID in URL + Bearer full token',
    `https://app.telecrm.in/api/b1/enterprise/${UUID_PART}/autoupdatelead`,
    { 'Authorization': `Bearer ${FULL_TOKEN}` });

  // Try 3: UUID in URL + secret as Bearer
  await test('UUID in URL + Bearer secret',
    `https://app.telecrm.in/api/b1/enterprise/${UUID_PART}/autoupdatelead`,
    { 'Authorization': `Bearer ${SECRET}` });

  // Try 4: Real enterprise ID + secret as Bearer
  await test('Real enterprise ID + Bearer secret',
    `https://app.telecrm.in/api/b1/enterprise/69d0d3b277280f7160851462/autoupdatelead`,
    { 'Authorization': `Bearer ${SECRET}` });

  // Try 5: Real enterprise ID + UUID as Bearer
  await test('Real enterprise ID + Bearer UUID',
    `https://app.telecrm.in/api/b1/enterprise/69d0d3b277280f7160851462/autoupdatelead`,
    { 'Authorization': `Bearer ${UUID_PART}` });
})();
