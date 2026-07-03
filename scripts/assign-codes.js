const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignCodes() {
  console.log('🔄 Asignando códigos a ejemplares existentes...');

  try {
    // Obtener todos los libros con sus ejemplares
    const books = await prisma.book.findMany({
      include: {
        copies: true,
      },
    });

    console.log(`📚 Encontrados ${books.length} libros`);

    let updatedCount = 0;

    for (const book of books) {
      // Obtener ISBN limpio
      let isbn = book.isbn || 'SINISBN';
      isbn = isbn.replace(/-/g, '');

      // Obtener ejemplares de este libro
      const copies = book.copies;
      
      // Ordenar por fecha de creación
      const sortedCopies = copies.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      console.log(`\n📖 "${book.title}" - ISBN: ${isbn}`);
      console.log(`   ${sortedCopies.length} ejemplares`);

      let counter = 1;
      for (const copy of sortedCopies) {
        // Generar nuevo código
        const formattedNum = String(counter).padStart(3, '0');
        const newCode = `${isbn}-EJ-${formattedNum}`;

        // Actualizar el ejemplar
        await prisma.copy.update({
          where: { id: copy.id },
          data: { code: newCode },
        });

        console.log(`   ✅ ${newCode} - ${copy.id.slice(0, 8)}...`);
        counter++;
        updatedCount++;
      }
    }

    console.log(`\n✅ ${updatedCount} ejemplares actualizados correctamente`);

    // Verificar resultados
    const allCopies = await prisma.copy.findMany();
    console.log(`\n📊 Total de ejemplares en DB: ${allCopies.length}`);
    
    const withCode = allCopies.filter(c => c.code && c.code !== '');
    console.log(`📊 Con código asignado: ${withCode.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCodes();