import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client'; // this is run with tsx rather than being compiled into /tsout-server so it omits the .js extension

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.create({
    data: {
      name: 'Demo Account',
      credentialProvider: 'None',
      credentialSubject: 'test'
    }
  });

  await prisma.widget.createMany({
    data: [
      { name: 'Calendar' },
      { name: 'Email' }
    ]
  });

  await prisma.layout.createMany({
    data: [
      { public: true, ownerId: 1, gridSize: 'medium' },
      { public: true, ownerId: 1, gridSize: 'medium' },
      { public: true, ownerId: 1, gridSize: 'medium' },
      { public: true, ownerId: 1, gridSize: 'medium' }
    ]
  });

  await prisma.layoutElement.createMany({
    data: [
      { layoutId: 1, widgetId: 1, posX: 1, posY: 1, sizeX: 1, sizeY: 1 },
      { layoutId: 1, widgetId: 2, posX: 5, posY: 1, sizeX: 1, sizeY: 1 },
      { layoutId: 2, widgetId: 1, posX: 5, posY: 1, sizeX: 1, sizeY: 1 },
      { layoutId: 2, widgetId: 2, posX: 1, posY: 1, sizeX: 1, sizeY: 1 },
      { layoutId: 3, widgetId: 1, posX: 1, posY: 1, sizeX: 1, sizeY: 1 },
    ]
  });

  await prisma.theme.createMany({
    data: [
      { public: true, ownerId: 1, navColor: '#0000FF', bgColor: '#00FFFF', font: "Constantia" },
      { public: true, ownerId: 1, navColor: '#FF0000', bgColor: '#FF00FF', font: "Constantia" },
      { public: true, ownerId: 1, navColor: '#00FF00', bgColor: '#FFFF00', font: "Constantia" }
    ]
  });

  await prisma.dashboard.createMany({
    data: [
      { name: 'blue+cyan', ownerId: 1, themeId: 1, layoutId: 1 },
      { name: 'red+magenta', ownerId: 1, themeId: 2, layoutId: 2 }
    ]
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });