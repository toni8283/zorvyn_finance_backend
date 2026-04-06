const Seeder = require('../utils/seeder');

// Handy for resetting local demo data quickly.
Seeder.seed()
  .then((users) => {
    console.log('\n Test Accounts:');
    console.log('==================');
    users.forEach(u => {
      console.log(`Role: ${u.role.toUpperCase()}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.plainPassword}`);
      console.log('');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
