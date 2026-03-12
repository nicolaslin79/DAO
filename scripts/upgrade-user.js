const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/meihua_divination'
  });

  await client.connect();

  try {
    // Find test@example.com user
    const userResult = await client.query("SELECT id, email FROM users WHERE email = 'test@example.com'");
    if (userResult.rows.length === 0) {
      console.log('User test@example.com not found');
      return;
    }
    const userId = userResult.rows[0].id;
    console.log('Found user:', userId);

    // Calculate dates for yearly subscription (1 year from now)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    console.log('Start date:', now.toISOString());
    console.log('End date:', endDate.toISOString());

    // Check if subscription exists
    const subResult = await client.query('SELECT id FROM subscriptions WHERE "userId" = $1', [userId]);

    if (subResult.rows.length > 0) {
      // Update existing subscription
      await client.query(`
        UPDATE subscriptions
        SET plan = 'YEARLY', status = 'ACTIVE', "startDate" = $1, "endDate" = $2, "readingsLeft" = NULL
        WHERE "userId" = $3
      `, [now, endDate, userId]);
      console.log('Updated existing subscription to YEARLY (399 CNY)');
    } else {
      // Create new subscription
      await client.query(`
        INSERT INTO subscriptions (id, "userId", plan, status, "startDate", "endDate", "readingsLeft")
        VALUES (gen_random_uuid(), $1, 'YEARLY', 'ACTIVE', $2, $3, NULL)
      `, [userId, now, endDate]);
      console.log('Created new YEARLY subscription (399 CNY)');
    }

    // Verify the update
    const verifyResult = await client.query(`
      SELECT s.plan, s.status, s."startDate", s."endDate"
      FROM subscriptions s
      WHERE s."userId" = $1
    `, [userId]);
    console.log('Verification - Subscription:', verifyResult.rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
