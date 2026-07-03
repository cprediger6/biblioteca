const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPasswords() {
  try {
    const users = await prisma.user.findMany();
    
    console.log('📊 Estado de las contraseñas:');
    console.log('----------------------------------------');
    
    for (const user of users) {
      const isHashed = user.password.startsWith('$2') && user.password.length === 60;
      console.log(`👤 ${user.email}`);
      console.log(`   Contraseña: "${user.password}"`);
      console.log(`   Longitud: ${user.password.length}`);
      console.log(`   Hasheada: ${isHashed ? '✅ Sí' : '❌ No'}`);
      
      if (!isHashed) {
        // Intentar verificar con bcrypt (fallará)
        try {
          const isValid = await bcrypt.compare('admin123', user.password);
          console.log(`   🔑 ¿Coincide con "admin123"? ${isValid ? '✅ Sí' : '❌ No'}`);
        } catch (e) {
          console.log(`   ❌ Error al verificar: ${e.message}`);
        }
      }
      console.log('----------------------------------------');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPasswords();