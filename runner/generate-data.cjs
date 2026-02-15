const fs = require('fs');
const path = require('path');

// Seed-based pseudo-random for reproducibility
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const firstNames = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank",
  "Ivy", "Jack", "Karen", "Leo", "Mona", "Nate", "Olivia", "Paul",
  "Quinn", "Rita", "Sam", "Tina", "Uma", "Vince", "Wendy", "Xander",
  "Yuki", "Zara", "Aaron", "Beth", "Cody", "Dora", "Eli", "Fay",
  "Gus", "Holly", "Ivan", "Jade", "Kyle", "Luna", "Max", "Nina",
  "Oscar", "Petra", "Reed", "Sara", "Troy", "Ursa", "Val", "Wade",
  "Xena", "Yale", "Zoe", "Amir", "Bella", "Cruz", "Delia", "Ethan",
  "Flora", "Gage", "Hazel", "Igor", "Julia", "Kent", "Lily", "Miles",
  "Nora", "Owen", "Piper", "Ronan", "Stella", "Theo", "Viola", "Wyatt",
  "Aria", "Blake", "Clara", "Drake", "Elsa", "Finn", "Gemma", "Hugo",
  "Isla", "Joel", "Kira", "Lance", "Mira", "Neil", "Opal", "Priya",
  "Ravi", "Suki", "Tara", "Uri", "Vera", "Wren", "Yara", "Zeke",
  "Alma", "Beau", "Cleo", "Dex"
];

const itemNames = [
  "Apple", "Bread", "Milk", "Cheese", "Butter", "Eggs", "Rice", "Pasta",
  "Chicken", "Beef", "Salmon", "Tuna", "Shrimp", "Tofu", "Beans", "Lentils",
  "Tomato", "Potato", "Onion", "Garlic", "Pepper", "Carrot", "Broccoli", "Spinach",
  "Lettuce", "Cucumber", "Avocado", "Banana", "Orange", "Grape", "Mango", "Peach",
  "Pear", "Plum", "Cherry", "Melon", "Kiwi", "Lemon", "Lime", "Fig",
  "Yogurt", "Cream", "Juice", "Water", "Soda", "Tea", "Coffee", "Cocoa",
  "Sugar", "Salt", "Flour", "Oil", "Vinegar", "Honey", "Syrup", "Mustard",
  "Ketchup", "Mayo", "Sauce", "Salsa", "Chips", "Crackers", "Cereal", "Oats",
  "Granola", "Nuts", "Seeds", "Raisins", "Dates", "Prunes", "Jam", "Peanut",
  "Almond", "Walnut", "Cashew", "Pecan", "Hazel", "Pistachio", "Coconut", "Olive",
  "Pickle", "Radish", "Celery", "Corn", "Peas", "Squash", "Yam", "Turnip",
  "Beet", "Fennel", "Basil", "Thyme", "Mint", "Sage", "Dill", "Parsley",
  "Cumin", "Clove", "Ginger", "Paprika"
];

const cities = [
  "Oslo", "Bergen", "Tromso", "Stavanger", "Drammen", "Bodo", "Hamar",
  "Molde", "Narvik", "Floro", "Larvik", "Tonsberg", "Arendal", "Mandal", "Elverum",
  "Gjovik", "Halden", "Horten", "Moss", "Ski", "Asker", "Baerum", "Lillestrom",
  "Jessheim", "Kongsberg", "Honefoss", "Sandefjord", "Porsgrunn", "Skien", "Notodden",
  "Rjukan", "Kragero", "Risor", "Tvedestrand", "Grimstad", "Lillesand", "Kristiansand",
  "Vennesla", "Lyngdal", "Farsund", "Flekkefjord", "Egersund", "Bryne", "Sandnes",
  "Haugesund", "Stord", "Odda", "Voss", "Sogndal", "Forde", "Nordfjordeid",
  "Stranda", "Volda", "Orsta", "Alesund", "Kristiansund", "Sunndalsora", "Oppdal",
  "Roros", "Tynset", "Alvdal", "Trysil", "Rendalen", "Engerdal", "Tolga",
  "Folldal", "Os", "Nybergsund", "Grue", "Kongsvinger", "Skarnes", "Magnor",
  "Eidskog", "Aurskog", "Sorumsand", "Fetsund", "Enebakk", "Vestby", "Aas",
  "Drobak", "Nesodden", "Oppegard", "Kolbotn", "Langhus", "Siggerud", "Vinterbro",
  "Tusenfryd", "Brumunddal", "Moelv", "Lillehammer", "Vinstra", "Otta", "Lom",
  "Vaga", "Dombas", "Hjerkinn", "Fredrikstad", "Sarpsborg", "Mysen", "Askim",
  "Rakkestad", "Spydeberg"
];

const base = path.join(__dirname, 'problems');

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function writeCsv(filePath, headers, rows) {
  let csv = headers.join(',') + '\n';
  for (const row of rows) {
    csv += row.join(',') + '\n';
  }
  fs.writeFileSync(filePath, csv);
}

// ========== TASK 5: JSON Name Lookup ==========
function genTask5() {
  function makeDataset(size, mustInclude = {}, mustExclude = []) {
    const used = new Set(Object.keys(mustInclude));
    mustExclude.forEach(n => used.add(n));
    const data = [];
    for (const [name, score] of Object.entries(mustInclude)) {
      data.push({ name, score });
    }
    const available = firstNames.filter(n => !used.has(n));
    for (let i = 0; data.length < size && i < available.length; i++) {
      data.push({ name: available[i], score: randInt(1, 100) });
    }
    // If we still need more entries, generate numbered names
    let extra = 1;
    while (data.length < size) {
      data.push({ name: `Person${extra}`, score: randInt(1, 100) });
      extra++;
    }
    return shuffle(data);
  }

  writeJson(path.join(base, '5/sample1/data.json'), makeDataset(100, { "Alice": 95, "Bob": 82 }));
  writeJson(path.join(base, '5/sample2/data.json'), makeDataset(100, { "Alice": 95, "Bob": 82 }));
  writeJson(path.join(base, '5/sample3/data.json'), makeDataset(100, {}, ["Charlie"]));
  writeJson(path.join(base, '5/hidden1/data.json'), makeDataset(100, { "Zara": 100, "Yuki": 77, "Xander": 63 }));
  console.log('Task 5: done (tests.json unchanged)');
}

// ========== TASK 6: CSV Average ==========
function genTask6() {
  const tests = [];

  // sample1: name,score - query "score"
  {
    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([firstNames[i % firstNames.length], (randInt(5000, 10000) / 100).toFixed(2)]);
    }
    writeCsv(path.join(base, '6/sample1/data.csv'), ['name', 'score'], rows);
    const avg = rows.reduce((s, r) => s + parseFloat(r[1]), 0) / 100;
    tests.push({ name: "sample1", input: "score\n", expected: avg.toFixed(2), hidden: false, files: ["data.csv"] });
    console.log(`Task 6 sample1: avg=${avg.toFixed(2)}`);
  }

  // sample2: score,grade - query "name" -> NOT_FOUND
  {
    const grades = ['A', 'B', 'C', 'D', 'F'];
    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([(randInt(5000, 10000) / 100).toFixed(1), pick(grades)]);
    }
    writeCsv(path.join(base, '6/sample2/data.csv'), ['score', 'grade'], rows);
    tests.push({ name: "sample2", input: "name\n", expected: "NOT_FOUND", hidden: false, files: ["data.csv"] });
    console.log('Task 6 sample2: NOT_FOUND');
  }

  // sample3: item,price - query "price"
  {
    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([itemNames[i % itemNames.length], (randInt(100, 5000) / 100).toFixed(2)]);
    }
    writeCsv(path.join(base, '6/sample3/data.csv'), ['item', 'price'], rows);
    const avg = rows.reduce((s, r) => s + parseFloat(r[1]), 0) / 100;
    tests.push({ name: "sample3", input: "price\n", expected: avg.toFixed(2), hidden: false, files: ["data.csv"] });
    console.log(`Task 6 sample3: avg=${avg.toFixed(2)}`);
  }

  // hidden1: id,value - query "value"
  {
    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([i + 1, (randInt(100, 1000) / 100).toFixed(2)]);
    }
    writeCsv(path.join(base, '6/hidden1/data.csv'), ['id', 'value'], rows);
    const avg = rows.reduce((s, r) => s + parseFloat(r[1]), 0) / 100;
    tests.push({ name: "hidden1", input: "value\n", expected: avg.toFixed(2), hidden: true, files: ["data.csv"] });
    console.log(`Task 6 hidden1: avg=${avg.toFixed(2)}`);
  }

  // hidden2: city,temp - query "temp"
  {
    const rows = [];
    for (let i = 0; i < 100; i++) {
      rows.push([cities[i % cities.length], (randInt(500, 3500) / 100).toFixed(2)]);
    }
    writeCsv(path.join(base, '6/hidden2/data.csv'), ['city', 'temp'], rows);
    const avg = rows.reduce((s, r) => s + parseFloat(r[1]), 0) / 100;
    tests.push({ name: "hidden2", input: "temp\n", expected: avg.toFixed(2), hidden: true, files: ["data.csv"] });
    console.log(`Task 6 hidden2: avg=${avg.toFixed(2)}`);
  }

  writeJson(path.join(base, '6/tests.json'), tests);
  console.log('Task 6: done (tests.json updated)');
}

// ========== TASK 7: CSV Top Scorer ==========
function genTask7() {
  const tests = [];

  function writeCsvScores(filePath, rows) {
    let csv = 'name,score\n';
    for (const [name, score] of rows) {
      csv += `${name},${score}\n`;
    }
    fs.writeFileSync(filePath, csv);
  }

  // sample1: Bob should be highest
  {
    const rows = [["Bob", 95]];
    const pool = firstNames.filter(n => n !== "Bob");
    for (let i = 0; rows.length < 100 && i < pool.length; i++) {
      rows.push([pool[i], randInt(10, 94)]);
    }
    shuffle(rows);
    writeCsvScores(path.join(base, '7/sample1/data.csv'), rows);
    tests.push({ name: "sample1", input: "", expected: "Bob", hidden: false, files: ["data.csv"] });
    console.log(`Task 7 sample1: Bob=95`);
  }

  // sample2: Zara should be highest (tie with Yuki, Zara first in file)
  {
    const rest = [];
    const pool = firstNames.filter(n => n !== "Zara" && n !== "Yuki");
    for (let i = 0; rest.length < 98 && i < pool.length; i++) {
      rest.push([pool[i], randInt(10, 59)]);
    }
    shuffle(rest);
    const rows = [["Zara", 60], ["Yuki", 60], ...rest];
    writeCsvScores(path.join(base, '7/sample2/data.csv'), rows);
    tests.push({ name: "sample2", input: "", expected: "Zara", hidden: false, files: ["data.csv"] });
    console.log('Task 7 sample2: Zara=60 (tie, first)');
  }

  // hidden1: Gamma should be highest
  {
    const rows = [["Gamma", 99]];
    for (let i = 0; rows.length < 100 && i < firstNames.length; i++) {
      rows.push([firstNames[i], randInt(10, 98)]);
    }
    shuffle(rows);
    writeCsvScores(path.join(base, '7/hidden1/data.csv'), rows);
    tests.push({ name: "hidden1", input: "", expected: "Gamma", hidden: true, files: ["data.csv"] });
    console.log('Task 7 hidden1: Gamma=99');
  }

  // hidden2: Solo should be highest
  {
    const rows = [["Solo", 100]];
    for (let i = 0; rows.length < 100 && i < firstNames.length; i++) {
      rows.push([firstNames[i], randInt(10, 99)]);
    }
    shuffle(rows);
    writeCsvScores(path.join(base, '7/hidden2/data.csv'), rows);
    tests.push({ name: "hidden2", input: "", expected: "Solo", hidden: true, files: ["data.csv"] });
    console.log('Task 7 hidden2: Solo=100');
  }

  writeJson(path.join(base, '7/tests.json'), tests);
  console.log('Task 7: done (tests.json updated)');
}

// ========== TASK 8: JSON Inventory Total ==========
function genTask8() {
  const tests = [];

  // sample1: 100 items with varied realistic prices
  {
    const items = [];
    for (let i = 0; i < 100; i++) {
      const price = parseFloat((randInt(10, 2000) / 100).toFixed(2));
      const qty = randInt(1, 20);
      items.push({ item: itemNames[i % itemNames.length], price, qty });
    }
    writeJson(path.join(base, '8/sample1/data.json'), items);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    tests.push({ name: "sample1", input: "", expected: total.toFixed(2), hidden: false, files: ["data.json"] });
    console.log(`Task 8 sample1: total=${total.toFixed(2)}`);
  }

  // sample2: 100 items with mid-range prices
  {
    const items = [];
    for (let i = 0; i < 100; i++) {
      const price = parseFloat((randInt(50, 5000) / 100).toFixed(2));
      const qty = randInt(1, 10);
      items.push({ item: itemNames[i % itemNames.length], price, qty });
    }
    writeJson(path.join(base, '8/sample2/data.json'), items);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    tests.push({ name: "sample2", input: "", expected: total.toFixed(2), hidden: false, files: ["data.json"] });
    console.log(`Task 8 sample2: total=${total.toFixed(2)}`);
  }

  // hidden1: 100 items with higher prices
  {
    const items = [];
    for (let i = 0; i < 100; i++) {
      const price = parseFloat((randInt(100, 10000) / 100).toFixed(2));
      const qty = randInt(1, 15);
      items.push({ item: itemNames[i % itemNames.length], price, qty });
    }
    writeJson(path.join(base, '8/hidden1/data.json'), items);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    tests.push({ name: "hidden1", input: "", expected: total.toFixed(2), hidden: true, files: ["data.json"] });
    console.log(`Task 8 hidden1: total=${total.toFixed(2)}`);
  }

  // hidden2: 100 items with small prices (edge case)
  {
    const items = [];
    for (let i = 0; i < 100; i++) {
      const price = parseFloat((randInt(1, 100) / 100).toFixed(2));
      const qty = randInt(1, 5);
      items.push({ item: itemNames[i % itemNames.length], price, qty });
    }
    writeJson(path.join(base, '8/hidden2/data.json'), items);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    tests.push({ name: "hidden2", input: "", expected: total.toFixed(2), hidden: true, files: ["data.json"] });
    console.log(`Task 8 hidden2: total=${total.toFixed(2)}`);
  }

  writeJson(path.join(base, '8/tests.json'), tests);
  console.log('Task 8: done (tests.json updated)');
}

// Run all generators
genTask5();
genTask6();
genTask7();
genTask8();

console.log('\nAll data files generated!');
