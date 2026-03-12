const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/meihua_divination'
  });

  await client.connect();

  try {
    const result = await client.query("SELECT id, email, name, password FROM users WHERE email = 'test@example.com'");
    if (result.rows.length > 0) {
      console.log('User found:');
      console.log('ID:', result.rows[0].id);
      console.log('Email:', result.rows[0].email);
      console.log('Name:', result.rows[0].name);
      console.log('Password hash:', result.rows[0].password);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
