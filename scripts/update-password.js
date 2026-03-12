const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/meihua_divination'
  });

  await client.connect();

  try {
    // Hash the new password
    const newPassword = 'test123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await client.query(
      "UPDATE users SET password = $1 WHERE email = 'test@example.com'",
      [hashedPassword]
    );

    console.log('Password updated to: test123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
