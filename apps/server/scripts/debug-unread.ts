import { prisma } from '@vochatix/db';

async function main() {
  const messages = await prisma.message.findMany({
    where: {
      status: { not: 'SEEN' }
    },
    include: {
      conversation: { select: { id: true, type: true } },
      sender: { select: { id: true, name: true } }
    }
  });

  console.log(`Found ${messages.length} unread messages in total.`);
  for (const msg of messages) {
    console.log(`- [${msg.type}] text: "${msg.text}", status: ${msg.status}, sender: ${msg.sender?.name || 'SYSTEM'}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

