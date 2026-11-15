
const InventoryUtils = require("./inventory.js");

// Sample inventory records
const items = [
    {
        name: "Laptop",
        quantity: 5,
        unitPrice: 50000,
        reorderLevel: 2
    },
    {
        name: "Mouse",
        quantity: 3,
        unitPrice: 800,
        reorderLevel: 5
    }
];

// Calculate inventory summary
const summary = InventoryUtils.getInventorySummary(items);

console.log("INVENTORY SUMMARY");
console.log("-----------------");
console.log("Total Units:", summary.totalUnits);
console.log("Total Stock Value:", summary.totalValue);
console.log("Low Stock Items:", summary.lowStockItems);
