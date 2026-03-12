import prisma from '../src/lib/db/prisma';

async function main() {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: { subscription: true },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Found user:', user.id, user.email);

  // Calculate dates for yearly subscription
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);

  // Create or update subscription
  if (user.subscription) {
    const updated = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: 'YEARLY',
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
      },
    });
    console.log('Updated subscription:', updated);
  } else {
    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'YEARLY',
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
      },
    });
    console.log('Created subscription:', created);
  }

  // Verify the update
  const verify = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: { subscription: true },
  });
  console.log('Verification - User subscription:', verify?.subscription);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
