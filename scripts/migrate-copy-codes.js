const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateCopyCodes() {
  console.log('🔄 Migrando ejemplares a nuevo formato con ISBN...');

  // Obtener todos los libros con sus ejemplares
  const books = await prisma.book.findMany({
    include: {
      copies: true,
    },
  });

  let updatedCount = 0;

  for (const book of books) {
    // Obtener ISBN limpio
    let isbn = book.isbn || 'SINISBN';
    isbn = isbn.replace(/-/g, '');

    // Obtener ejemplares de este libro
    const copies = book.copies;
    
    // Ordenar por fecha de creación para mantener consistencia
    const sortedCopies = copies.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let counter = 1;
    for (const copy of sortedCopies) {
      // Si ya tiene código válido, saltar
      if (copy.code && copy.code.includes('-EJ-')) {
        console.log(`⏭️ ${copy.code} ya tiene código válido`);
        continue;
      }

      // Generar nuevo código
      const formattedNum = String(counter).padStart(3, '0');
      const newCode = `${isbn}-EJ-${formattedNum}`;

      // Actualizar
      await prisma.copy.update({
        where: { id: copy.id },
        data: { code: newCode },
      });

      console.log(`✅ ${newCode} - ${book.title}`);
      counter++;
      updatedCount++;
    }
  }

  console.log(`\n✅ ${updatedCount} ejemplares actualizados`);
}

migrateCopyCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());