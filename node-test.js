// Run this test using: node node-test.js
const InventoryUtils = require("./inventory.js");

const sampleItems = [
  { name: "A4 paper", quantity: 10, unitPrice: 450, reorderLevel: 5 },
  { name: "Pens", quantity: 3, unitPrice: 20, reorderLevel: 5 }
];

console.log("Stock value for A4 paper:", InventoryUtils.calculateStockValue(10, 450));
console.log("Are pens low in stock?", InventoryUtils.isLowStock(3, 5));
console.log("Inventory summary:", InventoryUtils.getInventorySummary(sampleItems));
