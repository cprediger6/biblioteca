const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCopyCodes() {
  console.log('🔧 Arreglando códigos de ejemplares...');

  try {
    // 1. Obtener todos los ejemplares
    const copies = await prisma.copy.findMany({
      include: {
        book: true,
      },
    });
    
    console.log(`📊 Encontrados ${copies.length} ejemplares`);

    // 2. Agrupar por ISBN o por libro
    const booksMap = new Map();
    
    for (const copy of copies) {
      const isbn = copy.book.isbn || 'SINISBN';
      const cleanIsbn = isbn.replace(/-/g, '');
      
      if (!booksMap.has(cleanIsbn)) {
        booksMap.set(cleanIsbn, []);
      }
      booksMap.get(cleanIsbn).push(copy);
    }

    console.log(`📚 ${booksMap.size} grupos de ISBN encontrados`);

    // 3. Asignar códigos únicos
    let updatedCount = 0;
    let deletedCount = 0;

    for (const [isbn, copiesList] of booksMap) {
      // Ordenar por fecha de creación
      copiesList.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let counter = 1;
      for (const copy of copiesList) {
        // Si ya tiene un código válido y es único, saltar
        if (copy.code && copy.code.includes('-EJ-')) {
          // Verificar si es único
          const existing = await prisma.copy.findFirst({
            where: {
              code: copy.code,
              NOT: { id: copy.id },
            },
          });
          if (!existing) {
            console.log(`⏭️ ${copy.code} - Ya tiene código válido y único`);
            continue;
          }
        }

        // Generar nuevo código
        const formattedNum = String(counter).padStart(3, '0');
        const newCode = `${isbn}-EJ-${formattedNum}`;

        // Actualizar
        await prisma.copy.update({
          where: { id: copy.id },
          data: { code: newCode },
        });

        console.log(`✅ ${newCode} - ${copy.book.title}`);
        counter++;
        updatedCount++;
      }
    }

    console.log(`\n✅ ${updatedCount} ejemplares actualizados`);

    // 4. Verificar duplicados finales
    const allCopies = await prisma.copy.findMany();
    const codeSet = new Set();
    let hasDuplicates = false;

    for (const copy of allCopies) {
      if (codeSet.has(copy.code)) {
        console.log(`⚠️ Duplicado encontrado: ${copy.code}`);
        hasDuplicates = true;
      }
      codeSet.add(copy.code);
    }

    if (!hasDuplicates) {
      console.log('✅ No hay códigos duplicados');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCopyCodes();