const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCopies() {
  try {
    const copies = await prisma.copy.findMany();
    
    console.log('📊 Estado actual de los ejemplares:');
    console.log('----------------------------------------');
    
    // Verificar duplicados de code
    const codeMap = new Map();
    const duplicates = [];
    
    for (const copy of copies) {
      console.log(`ID: ${copy.id}`);
      console.log(`  Code: "${copy.code}"`);
      console.log(`  Status: ${copy.status}`);
      console.log(`  BookId: ${copy.bookId}`);
      console.log('----------------------------------------');
      
      if (copy.code) {
        if (codeMap.has(copy.code)) {
          duplicates.push(copy.code);
        } else {
          codeMap.set(copy.code, true);
        }
      }
    }
    
    console.log(`\n📊 Total de ejemplares: ${copies.length}`);
    console.log(`📊 Códigos duplicados: ${duplicates.length > 0 ? duplicates.join(', ') : 'Ninguno'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCopies();