import { db } from './index';
import { users, categories, warehouses } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.insert(users).values({
      email: 'admin@dshome.dev',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active'
    });
    console.log('✅ Admin user created');

    // Create default warehouse
    await db.insert(warehouses).values({
      name: 'Главен склад',
      address: 'ул. Примерна 1, 1000 София',
      phone: '+359 2 123 4567',
      status: 'active',
      workingHours: 'Пон-Пет: 9:00-18:00',
      isPhysicalStore: true
    });
    console.log('✅ Default warehouse created');

    // Create sample categories
    await db.insert(categories).values([
      {
        name: 'Електроника',
        slug: 'elektronika',
        description: 'Електронни устройства и аксесоари',
        position: 1,
        status: 'active'
      },
      {
        name: 'Дом и градина',
        slug: 'dom-i-gradina',
        description: 'Продукти за дома и градината',
        position: 2,
        status: 'active'
      },
      {
        name: 'Мода',
        slug: 'moda',
        description: 'Облекло и аксесоари',
        position: 3,
        status: 'active'
      }
    ]);
    console.log('✅ Sample categories created');

    console.log('🎉 Seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('  Email: admin@dshome.dev');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
