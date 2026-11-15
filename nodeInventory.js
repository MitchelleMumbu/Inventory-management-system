const readline = require("readline");
const InventoryUtils = require("./inventory.js");
const fs = require("fs");
const path = require("path");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const DATA_FILE = path.join(__dirname, "inventory-data.json");
// Load saved inventory records
function loadItems() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.log("Error loading inventory data:", error.message);
        return [];
    }
}
// Save inventory records
function saveItems() {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(items, null, 4)
    );
}
let items = loadItems();
// Function for asking questions
function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}
// Add a new inventory item
async function addItem() {
    console.log("\n--- ADD INVENTORY ITEM ---");
    const name = await ask("Item name: ");
    const category = await ask("Category: ");
    const quantity = Number(await ask("Quantity: "));
    const unitPrice = Number(await ask("Unit price (KSh): "));
    const reorderLevel = Number(await ask("Reorder level: "));
    if (!name || !category) {
        console.log("Name and category cannot be empty.");
        return;
    }
    if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        console.log("An item with this name already exists.");
        return;
    }
    if (
        !Number.isInteger(quantity) || quantity < 0 ||
        !Number.isFinite(unitPrice) || unitPrice < 0 ||
        !Number.isInteger(reorderLevel) || reorderLevel < 0
    ) {
        console.log("Please enter valid non-negative numbers.");
        return;
    }
    const newItem = {
        id: Date.now(),
        name,
        category,
        quantity,
        unitPrice,
        reorderLevel
    };
    items.push(newItem);
    saveItems();
    console.log("\nItem added successfully!");
}
async function editItem() {
    console.log("\n--- EDIT INVENTORY ITEM ---");
    if (items.length === 0) {
        console.log("No inventory items available.");
        return;
    }
    // Display existing items
    items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
    });
    const itemNumber = Number(await ask("\nEnter item number to edit: "));
    if (
        !Number.isInteger(itemNumber) ||
        itemNumber < 1 ||
        itemNumber > items.length
    ) {
        console.log("Invalid item number.");
        return;
    }
    const item = items[itemNumber - 1];
    console.log("\nLeave a field blank to keep its current value.");
    const name = await ask(`New name (${item.name}): `);
    const category = await ask(`New category (${item.category}): `);
    const quantityInput = await ask(`New quantity (${item.quantity}): `);
    const priceInput = await ask(`New unit price (${item.unitPrice}): `);
    const reorderInput = await ask(`New reorder level (${item.reorderLevel}): `);
    const updatedItem = {
        name: name || item.name,
        category: category || item.category,
        quantity: quantityInput === "" ? item.quantity : Number(quantityInput),
        unitPrice: priceInput === "" ? item.unitPrice : Number(priceInput),
        reorderLevel: reorderInput === "" ? item.reorderLevel : Number(reorderInput)
    };
    if (
        !Number.isInteger(updatedItem.quantity) ||
        updatedItem.quantity < 0 ||
        !Number.isFinite(updatedItem.unitPrice) ||
        updatedItem.unitPrice < 0 ||
        !Number.isInteger(updatedItem.reorderLevel) ||
        updatedItem.reorderLevel < 0
    ) {
        console.log("Invalid values. Please try again.");
        return;
    }
    const duplicate = items.some((existingItem, index) =>
        index !== itemNumber - 1 &&
        existingItem.name.toLowerCase() === updatedItem.name.toLowerCase()
    );
    if (duplicate) {
        console.log("Another item already uses that name.");
        return;
    }
    Object.assign(item, updatedItem);
    saveItems();
    console.log("\nInventory item updated successfully!");
}
// Delete an inventory item
async function deleteItem() {
    console.log("\n--- DELETE INVENTORY ITEM ---");
    if (items.length === 0) {
        console.log("No inventory items available.");
        return;
    }
    // Display available items
    items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
    });
    const itemNumber = Number(
        await ask("\nEnter item number to delete: ")
    );
    if (
        !Number.isInteger(itemNumber) ||
        itemNumber < 1 ||
        itemNumber > items.length
    ) {
        console.log("Invalid item number.");
        return;
    }
    const item = items[itemNumber - 1];
    const confirmation = await ask(
        `Are you sure you want to delete ${item.name}? (yes/no): `
    );
    if (confirmation.toLowerCase() !== "yes") {
        console.log("Deletion cancelled.");
        return;
    }
    items.splice(itemNumber - 1, 1);
    saveItems();
    console.log(`${item.name} deleted successfully!`);
}
// Display low stock items
function showLowStock() {
    console.log("\n--- LOW STOCK REPORT ---");
    const lowStockItems = items.filter(item =>
        InventoryUtils.isLowStock(
            item.quantity,
            item.reorderLevel
        )
    );
    if (lowStockItems.length === 0) {
        console.log("No low-stock items. Stock levels look good!");
        return;
    }
    console.log("\nItems requiring attention:");
    lowStockItems.forEach(item => {
        const status = item.quantity === 0
            ? "OUT OF STOCK"
            : "LOW STOCK";
        console.log("\nItem:", item.name);
        console.log("Category:", item.category);
        console.log("Available Quantity:", item.quantity);
        console.log("Reorder Level:", item.reorderLevel);
        console.log("Status:", status);
    });
    console.log("\nTotal items requiring attention:", lowStockItems.length);
}
// View all inventory items
function viewItems() {
    console.log("\n--- INVENTORY ITEMS ---");
    if (items.length === 0) {
        console.log("No inventory items available.");
        return;
    }
    items.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`Category: ${item.category}`);
        console.log(`Quantity: ${item.quantity}`);
        console.log(`Unit Price: KSh ${item.unitPrice}`);
        console.log(
            `Stock Value: KSh ${
                InventoryUtils.calculateStockValue(
                    item.quantity,
                    item.unitPrice
                )
            }`
        );
    });
}
async function searchItem() {
    console.log("\n--- SEARCH INVENTORY ---");
    if (items.length === 0) {
        console.log("No inventory items available.");
        return;
    }
    const searchName = await ask("Enter item name to search: ");
    const results = items.filter(item =>
        item.name.toLowerCase().includes(searchName.toLowerCase())
    );
    if (results.length === 0) {
        console.log("No matching items found.");
        return;
    }
    console.log("\n--- SEARCH RESULTS ---");
    results.forEach(item => {
        console.log("\nItem:", item.name);
        console.log("Category:", item.category);
        console.log("Quantity:", item.quantity);
        console.log("Unit Price: KSh", item.unitPrice);
        console.log(
            "Stock Value: KSh",
            InventoryUtils.calculateStockValue(
                item.quantity,
                item.unitPrice
            )
        );
    });
}
// Display inventory summary
function showSummary() {
    console.log("\n--- INVENTORY SUMMARY ---");
    const summary = InventoryUtils.getInventorySummary(items);
    console.log("Total Items:", items.length);
    console.log("Total Units:", summary.totalUnits);
    console.log("Total Stock Value: KSh", summary.totalValue);
    console.log("Low Stock Items:", summary.lowStockItems);
}
// Main application menu
async function main() {
    let running = true;
    while (running) {
        console.log("\n==============================");
        console.log(" INVENTORY MANAGEMENT SYSTEM ");
        console.log("==============================");
        console.log("1. Add Item");
        console.log("2. View Inventory");
        console.log("3. Inventory Summary");
        console.log("4. Search Item");
        console.log("5. Edit Item");
        console.log("6. Delete Item");
        console.log("7. Low Stock Report");
        console.log("8. Exit");
        const choice = await ask("\nSelect an option: ");
        switch (choice) {
            case "1":
                await addItem();
                break;
            case "2":
                viewItems();
                break;
            case "3":
                showSummary();
                break;
            case "4":
                await searchItem();
                break;
            case "5":
                await editItem();
                break;
            case "6":
                await deleteItem();
                break;
            case "7":
                showLowStock();
                break;
            case "8":
                running = false;
                console.log("Thank you for using the system!");
                break;
            default:
                console.log("Invalid option. Please try again.");
        }
    }
    rl.close();
}
main();