const fs = require('fs');
const path = require('path');

function validateGames(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(2);
  }
  if (!Array.isArray(data)) {
    console.error('Expected an array of games');
    process.exit(3);
  }
  for (const g of data) {
    if (typeof g.id !== 'number' || !g.title) {
      console.error('Missing required fields in game', g);
      process.exit(4);
    }
  }
  console.log('games.json looks valid —', data.length, 'entries');
}

const target = path.resolve(process.cwd(), '..', 'data', 'games.sample.json');
if (!fs.existsSync(target)) {
  console.error('Sample data not found at', target);
  process.exit(1);
}
validateGames(target);
