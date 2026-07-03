const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswords() {
  console.log('🔐 Arreglando contraseñas...');

  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany();
    console.log(`📊 Encontrados ${users.length} usuarios`);

    let updatedCount = 0;

    for (const user of users) {
      // Verificar si ya está hasheada
      const isHashed = user.password.startsWith('$2') && user.password.length === 60;
      
      if (isHashed) {
        console.log(`✅ ${user.email} - Ya hasheada`);
        continue;
      }

      // Si la contraseña es "admin123" o "user123", usar esas
      let plainPassword = user.password;
      
      // Si la contraseña es "admin123" o "user123", mantenerla
      // Si no, usar "admin123" por defecto
      if (!['admin123', 'user123'].includes(plainPassword)) {
        plainPassword = 'admin123';
      }

      console.log(`🔑 ${user.email} - Hasheando contraseña: "${plainPassword}"`);
      
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`✅ ${user.email} - Contraseña hasheada correctamente`);
      updatedCount++;
    }

    console.log(`\n✅ ${updatedCount} contraseñas hasheadas`);

    // Verificar
    console.log('\n🔍 Verificando...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@biblioteca.com' }
    });

    if (testUser) {
      const isValid = await bcrypt.compare('admin123', testUser.password);
      console.log(`🔑 admin@biblioteca.com con "admin123": ${isValid ? '✅ Válida' : '❌ Inválida'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();