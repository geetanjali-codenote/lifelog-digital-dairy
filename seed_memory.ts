import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found to attach memory to.");
    return;
  }

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      title: "Test Memory for Gallery",
      content: "Testing the new gallery upload functionality!",
      mood: "happy",
      entryDate: new Date(),
      attachments: {
        create: [
          { fileUrl: "https://images.unsplash.com/photo-1506744626753-1fa44df661b6?q=80&w=600&auto=format&fit=crop", title: "Valley View", description: "A great view of the valley." },
          { fileUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop", title: "Forest Path", description: "Walking in the forest." }
        ]
      }
    }
  });
  console.log("Created memory:", entry.id);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
