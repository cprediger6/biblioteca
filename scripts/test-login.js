const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@biblioteca.com';
    const password = 'admin123';

    console.log(`🔍 Probando login para: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado');
    console.log('📝 Hash almacenado:', user.password);

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`🔑 Contraseña "${password}": ${isValid ? '✅ Válida' : '❌ Inválida'}`);

    if (isValid) {
      console.log('\n✅ ¡El login funcionaría correctamente!');
      console.log('📋 Datos del usuario:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
    } else {
      console.log('\n❌ La contraseña no coincide');
      console.log('💡 Sugerencia: Ejecuta node scripts/create-admin.js');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();