# Inventory Management System

A simple Inventory Management System developed using **HTML, CSS, and JavaScript**, with two implementations: a browser-based application and a Node.js command-line application.

## 1. Project Overview

The Inventory Management System is designed to help users manage inventory records, monitor available stock, identify low-stock items and calculate the value of inventory.

The project provides two ways of managing inventory:

- **Browser Application:** A graphical interface that allows users to manage inventory through a web browser.
- **Node.js Application:** A command-line interface that allows users to perform inventory operations through a terminal.

The project demonstrates how JavaScript can be used to develop applications for different environments while reusing common inventory logic.

## 2. Problem Statement

Managing inventory manually can make it difficult to keep accurate records, monitor stock quantities, identify products that need restocking and calculate the total value of available inventory.

This system provides a simple way to organise inventory records and perform common stock management operations.

## 3. Features

### Browser Application

- Add new inventory items.
- View available inventory records.
- Edit existing items.
- Delete inventory items.
- Search for specific items.
- Filter items by category.
- View inventory summaries.
- Calculate total stock value.
- Identify low-stock items.
- View inventory charts.
- Export inventory records to CSV.
- Print inventory reports.
- Save records using browser LocalStorage.

### Node.js Application

- Add inventory items.
- View inventory records.
- Search for items.
- Edit existing records.
- Delete items.
- View inventory summaries.
- Generate low-stock reports.
- Save and load inventory records using a JSON file.

## 4. Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Structures the browser interface. |
| CSS | Handles styling and layout. |
| JavaScript | Implements application functionality. |
| LocalStorage | Stores browser inventory records. |
| Node.js | Runs the command-line application. |
| JSON | Stores Node.js inventory records. |

## 5. Project Structure

```text
inventory_management_system/
│
├── index.html
├── style.css
├── app.js
├── inventory.js
│
├── nodeInventory.js
├── node-test.js
├── testInventory.js
│
└── inventory-data.json
```

**Note:** `inventory-data.json` is used by the Node.js application for data persistence. It may be generated when the application runs and is excluded from Git so that local inventory data is not committed.

## 6. Shared Inventory Functions

The project includes a reusable JavaScript module named `inventory.js`.

It contains common inventory functions used by both implementations.

Some of these include:

- `calculateStockValue()` – Calculates the value of stock using quantity and unit price.
- `isLowStock()` – Checks whether an item's quantity has reached or fallen below its reorder level.
- `getInventorySummary()` – Generates a summary of inventory information.

This approach reduces duplicated code and helps maintain consistent inventory calculations.

## 7. How to Run the Project

### Browser Application

1. Clone or download the repository.
2. Open the project folder.
3. Open `index.html` in a web browser.
4. Start using the inventory management features.

The browser application uses LocalStorage to save inventory records locally.

### Node.js Application

Make sure Node.js is installed on your computer.

1. Open the project folder in VS Code or a terminal.
2. Open the terminal.
3. Run the following command:

```bash
node nodeInventory.js
```

4. The command-line menu will appear.
5. Select an option and follow the instructions displayed.

The Node.js application stores its inventory records in a JSON file.

## 8. Data Storage

The two implementations use separate storage methods.

| Application | Storage | Description |
|---|---|---|
| Browser | LocalStorage | Stores inventory records in the browser. |
| Node.js | JSON file | Stores inventory records locally in a JSON file. |

The two applications do not currently share a central database. Records entered in one implementation are not automatically available in the other.

## 9. Testing

The project was tested to verify that the main inventory operations work as expected.

The reported test results are:

| Application | Tests Passed | Result |
|---|---:|---|
| Browser Application | 13/13 | Passed |
| Node.js Application | 12/12 | Passed |

All reported tests passed.

## 10. Limitations and Future Improvements

The current version focuses on basic inventory management functionality.

Possible future improvements include:

- Database integration using MySQL or PostgreSQL.
- User registration and authentication.
- Multi-user inventory management.
- Supplier management.
- Automatic data backups.
- More advanced reporting and analytics.

## 11. Project Purpose

This project was developed as a practical programming project to demonstrate the use of JavaScript in building functional applications.

It provides experience with browser-based development, Node.js, data persistence, reusable functions, inventory calculations and software testing.

## 12. Feedback and Analysis

Feedback, suggestions and constructive criticism are welcome.

The project can be reviewed to identify possible improvements in its functionality, code structure, user interface, data handling and overall design.
