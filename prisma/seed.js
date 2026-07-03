const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');

    // Hashear contraseñas correctamente
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Verificar si el usuario admin existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@biblioteca.com' }
    });

    let admin;
    if (existingAdmin) {
      // Actualizar contraseña si existe
      admin = await prisma.user.update({
        where: { email: 'admin@biblioteca.com' },
        data: {
          password: adminPassword,
          name: 'Administrador',
          role: 'admin',
        },
      });
      console.log('✅ Admin actualizado con contraseña hasheada:', admin.email);
    } else {
      // Crear si no existe
      admin = await prisma.user.create({
        data: {
          email: 'admin@biblioteca.com',
          name: 'Administrador',
          password: adminPassword,
          role: 'admin',
          phone: '123456789',
        },
      });
      console.log('✅ Admin creado:', admin.email);
    }

    // Verificar el usuario normal
    const existingUser = await prisma.user.findUnique({
      where: { email: 'usuario@biblioteca.com' }
    });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email: 'usuario@biblioteca.com' },
        data: {
          password: userPassword,
          name: 'Usuario Test',
          role: 'user',
        },
      });
      console.log('✅ Usuario actualizado con contraseña hasheada:', user.email);
    } else {
      user = await prisma.user.create({
        data: {
          email: 'usuario@biblioteca.com',
          name: 'Usuario Test',
          password: userPassword,
          role: 'user',
          phone: '987654321',
        },
      });
      console.log('✅ Usuario creado:', user.email);
    }

    // ... resto del seed (libros, préstamos, etc.)

    console.log('\n📊 Resumen:');
    console.log('👥 Usuarios:', await prisma.user.count());
    console.log('\n✅ ¡Datos creados exitosamente!');
    console.log('🔑 Credenciales:');
    console.log('   Admin: admin@biblioteca.com / admin123');
    console.log('   Usuario: usuario@biblioteca.com / user123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();