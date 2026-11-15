const STORAGE_KEY = "inventory-management-items-v1";
const form = document.getElementById("itemForm");
const inventoryBody = document.getElementById("inventoryBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const formMessage = document.getElementById("formMessage");
const alertList = document.querySelector(".alert-list");

let items = loadItems();
let editingId = null;
// LOAD SAVED ITEMS
function loadItems() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        return saved.map(item => ({
            ...item,
            category: item.category || "General"
        }));
    } catch (error) {
        return [];
    }
}
// SAVE ITEMS
function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
// FORMAT MONEY
function formatMoney(amount) {
    return "KSh " + Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
// ESCAPE HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[character]));
  }
// SHOW FORM MESSAGE
function showMessage(message, type = "") {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}
// RESET FORM
function resetForm() {
    form.reset();
    document.getElementById("reorderLevel").value = 5;
    editingId = null;
    form.querySelector("button[type='submit']").textContent = "+ Add Item";
}
// CHECK STOCK STATUS
function isLowStock(item) {
    return InventoryUtils.isLowStock(
        item.quantity,
        item.reorderLevel
    );
}
// DASHBOARD AND REPORT SUMMARY
function renderSummary() {
    const summary = InventoryUtils.getInventorySummary(items);
    // Dashboard summary
    document.getElementById("itemCount").textContent = items.length;
    document.getElementById("unitCount").textContent =
        summary.totalUnits.toLocaleString("en-KE");
    document.getElementById("stockValue").textContent =
        formatMoney(summary.totalValue);
    document.getElementById("lowStockCount").textContent =
        summary.lowStockItems;
    // Reports summary
    document.getElementById("reportItemCount").textContent =
        items.length;
    document.getElementById("reportUnitCount").textContent =
        summary.totalUnits.toLocaleString("en-KE");
    document.getElementById("reportStockValue").textContent =
        formatMoney(summary.totalValue);
    document.getElementById("reportLowStock").textContent =
        summary.lowStockItems;
}
// INVENTORY TABLE
function renderInventory() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
    const visibleItems = items.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory =
            !selectedCategory || item.category === selectedCategory;
        const low = isLowStock(item);
        const matchesStatus =
            !selectedStatus ||
            (selectedStatus === "low" && low) ||
            (selectedStatus === "ok" && !low);
        return matchesName && matchesCategory && matchesStatus;
    });
    if (visibleItems.length === 0) {
        inventoryBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">
                    ${items.length
                        ? "No items match your filters."
                        : "No inventory items yet. Add your first item above."}
                </td>
            </tr>`;
    } else {
        inventoryBody.innerHTML = visibleItems.map((item, index) => {
            const low = isLowStock(item);
            const value = InventoryUtils.calculateStockValue(
                item.quantity,
                item.unitPrice
            );
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="item-name">${escapeHTML(item.name)}</td>
                    <td>${escapeHTML(item.category)}</td>
                    <td>${item.quantity}</td>
                    <td class="money">${formatMoney(item.unitPrice)}</td>
                    <td class="money">${formatMoney(value)}</td>
                    <td>
                        <span class="stock-badge ${low ? "low" : "ok"}">
                            ${low ? "Low Stock" : "In Stock"}
                        </span>
                    </td>
                    <td>
                        <button type="button" class="edit-btn"
                            data-action="edit" data-id="${item.id}">
                            Edit
                        </button>
                        <button type="button" class="delete-btn"
                            data-action="delete" data-id="${item.id}">
                            Delete
                        </button>
                    </td>
                </tr>`;
        }).join("");
    }
    renderSummary();
    renderAlerts();
    renderChart();
    renderReportChart();
    renderPieChart();
    renderLowStockReport();
}
// LOW STOCK ALERTS
function renderAlerts() {
    const lowItems = items.filter(isLowStock);
    if (lowItems.length === 0) {
        alertList.innerHTML = `
            <p>✓ No low-stock items. Your stock levels look good!</p>`;
        return;
    }
    alertList.innerHTML = lowItems.map(item => `
        <div class="stock-alert">
            <div>
                <strong>${escapeHTML(item.name)}</strong>
                <p>Qty: ${item.quantity} | Reorder: ${item.reorderLevel}</p>
            </div>
            <span class="stock-badge low">Low Stock</span>
        </div>
    `).join("");
}
// CATEGORY CHART
function renderChart() {
    const totals = {};
    items.forEach(item => {
        const value = InventoryUtils.calculateStockValue(
            item.quantity,
            item.unitPrice
        );
        totals[item.category] = (totals[item.category] || 0) + value;
    });
    const categories = Object.entries(totals)
        .sort((a, b) => b[1] - a[1]);
    const chart = document.querySelector(".chart-bars");
    if (categories.length === 0) {
        chart.innerHTML = `
            <p class="chart-empty">Add inventory items to see category values.</p>`;
        return;
    }
    const maximum = Math.max(...categories.map(category => category[1]), 1);
    chart.innerHTML = categories.map(([name, value], index) => {
        const height = Math.max((value / maximum) * 100, 4);
        const colour = index % 2 === 0 ? "olive-bar" : "plum-bar";
        return `
            <div class="bar ${colour}" style="height: ${height}%">
                <span>${escapeHTML(name)}</span>
            </div>`;
    }).join("");
}
// REPORT CATEGORY CHART
function renderReportChart() {
    const totals = {};
    // Calculate stock value for each category
    items.forEach(item => {
        const value = InventoryUtils.calculateStockValue(
            item.quantity,
            item.unitPrice
        );
        totals[item.category] = (totals[item.category] || 0) + value;
    });
    const categories = Object.entries(totals)
        .sort((a, b) => b[1] - a[1]);
    const chart = document.getElementById("reportCategoryChart");
    if (categories.length === 0) {
        chart.innerHTML = `
            <p class="chart-empty">
                Add inventory items to generate category reports.
            </p>`;
        return;
    }
    const maximum = Math.max(...categories.map(category => category[1]), 1);
    chart.innerHTML = categories.map(([name, value], index) => {
        const percentage = (value / maximum) * 100;
        return `
            <div class="report-category-row">
                <div class="report-category-info">
                    <strong>${escapeHTML(name)}</strong>
                    <span>${formatMoney(value)}</span>
                </div>
                <div class="report-progress">
                    <div class="report-progress-fill ${index % 2 === 0 ? "olive-fill" : "plum-fill"}"
                         style="width: ${percentage}%">
                    </div>
                </div>
            </div>`;
    }).join("");
}
// REPORT PIE CHART
function renderPieChart() {
    const totals = {};
    // Calculate stock value per category
    items.forEach(item => {
        const value = InventoryUtils.calculateStockValue(
            item.quantity,
            item.unitPrice
        );
        totals[item.category] = (totals[item.category] || 0) + value;
    });
    const categories = Object.entries(totals)
        .filter(([name, value]) => value > 0);
    const totalValue = categories.reduce(
        (sum, category) => sum + category[1], 0
    );
    const pieChart = document.querySelector(".pie-chart-circle");
    const legend = document.getElementById("pieChartLegend");
    if (totalValue === 0) {
        pieChart.style.background = "#e8eadc";
        pieChart.querySelector("strong").textContent = "0%";
        legend.innerHTML = "<p>No stock value available yet.</p>";
        return;
    }
    const colours = [
        "#687747",
        "#4b1e3b",
        "#a1a878",
        "#b68a9f",
        "#d4bd91",
        "#53643a"
    ];
    let currentAngle = 0;
    const segments = categories.map(([name, value], index) => {
        const percentage = (value / totalValue) * 100;
        const angle = (value / totalValue) * 360;
        const segment = `${colours[index % colours.length]} ${currentAngle}deg ${currentAngle + angle}deg`;
        currentAngle += angle;
        return {
            name,
            value,
            percentage,
            colour: colours[index % colours.length],
            segment
        };
    });
    pieChart.style.background =
        `conic-gradient(${segments.map(item => item.segment).join(", ")})`;
    pieChart.querySelector("strong").textContent = "100%";
    legend.innerHTML = segments.map(item => `
        <div class="pie-legend-item">
            <span class="pie-legend-dot"
                style="background:${item.colour}"></span>
            <span>${escapeHTML(item.name)}</span>
            <strong>${item.percentage.toFixed(1)}%</strong>
        </div>
    `).join("");
}
// LOW STOCK REPORT TABLE
function renderLowStockReport() {
    const reportBody = document.getElementById("reportLowStockBody");
    // Get items that need restocking
    const lowItems = items.filter(isLowStock);
    if (lowItems.length === 0) {
        reportBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No low-stock items. Your stock levels look good!
                </td>
            </tr>`;
        return;
    }
    reportBody.innerHTML = lowItems.map(item => {
        const outOfStock = item.quantity === 0;
        const status = outOfStock ? "Out of Stock" : "Low Stock";
        return `
            <tr>
                <td class="item-name">${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${item.quantity}</td>
                <td>${item.reorderLevel}</td>
                <td>
                    <span class="stock-badge low">
                        ${status}
                    </span>
                </td>
            </tr>`;
    }).join("");
}
// ADD OR UPDATE ITEM
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value;
    const quantity = Number(document.getElementById("quantity").value);
    const unitPrice = Number(document.getElementById("unitPrice").value);
    const reorderLevel = Number(document.getElementById("reorderLevel").value);
    if (
        !name ||
        !Number.isInteger(quantity) || quantity < 0 ||
        !Number.isFinite(unitPrice) || unitPrice < 0 ||
        !Number.isInteger(reorderLevel) || reorderLevel < 0
    ) {
        showMessage("Please enter valid item details.", "error");
        return;
    }
    const duplicate = items.find(item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingId
    );
    if (duplicate) {
        showMessage("An item with that name already exists.", "error");
        return;
    }
    const itemData = {
        name,
        category,
        quantity,
        unitPrice,
        reorderLevel
    };
    if (editingId !== null) {
        items = items.map(item =>
            item.id === editingId ? { ...item, ...itemData } : item
        );
        showMessage("Item updated successfully.", "success");
    } else {
        items.push({
            id: Date.now(),
            ...itemData
        });
        showMessage("Item added successfully.", "success");
    }
    saveItems();
    resetForm();
    renderInventory();
});
// EDIT AND DELETE
inventoryBody.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const item = items.find(item => item.id === id);
    if (!item) return;
    if (action === "edit") {
        editingId = id;
        document.getElementById("itemName").value = item.name;
        document.getElementById("itemCategory").value = item.category;
        document.getElementById("quantity").value = item.quantity;
        document.getElementById("unitPrice").value = item.unitPrice;
        document.getElementById("reorderLevel").value = item.reorderLevel;
        form.querySelector("button[type='submit']").textContent = "Update Item";
        showMessage("Editing " + item.name);
        form.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "delete") {
        if (!confirm(`Delete ${item.name} from your inventory?`)) return;
        items = items.filter(item => item.id !== id);
        if (editingId === id) {
            resetForm();
        }
        saveItems();
        renderInventory();
        showMessage("Item deleted successfully.", "success");
    }
});
// SEARCH AND FILTER EVENTS
searchInput.addEventListener("input", renderInventory);
categoryFilter.addEventListener("change", renderInventory);
statusFilter.addEventListener("change", renderInventory);
document.querySelector(".search-btn").addEventListener("click", renderInventory);
document.querySelector(".reset-btn").addEventListener("click", function() {
    searchInput.value = "";
    categoryFilter.value = "";
    statusFilter.value = "";
    renderInventory();
});
// TOP SEARCH ALSO SEARCHES INVENTORY
document.querySelector(".top-search input").addEventListener("input", function() {
    searchInput.value = this.value;
    renderInventory();
});
// INITIAL DISPLAY
renderInventory();
// SIDEBAR NAVIGATION
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        // Update active link
        navLinks.forEach(nav => nav.classList.remove("active"));
        this.classList.add("active");
        // Get the target section
        const targetId = this.getAttribute("href");
        if (targetId && targetId !== "#") {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                history.replaceState(null, "", targetId);
            }
        }
    });
});

// EXPORT INVENTORY REPORT TO CSV
function exportInventoryCSV() {

    if (items.length === 0) {
        alert("There are no inventory records to export.");
        return;
    }

    const headers = [
        "Item Name",
        "Category",
        "Quantity",
        "Unit Price",
        "Stock Value",
        "Reorder Level",
        "Stock Status"
    ];

    const rows = items.map(item => {
        const stockValue = InventoryUtils.calculateStockValue(
            item.quantity,
            item.unitPrice
        );

        let status = "In Stock";

        if (item.quantity === 0) {
            status = "Out of Stock";
        } else if (isLowStock(item)) {
            status = "Low Stock";
        }

        return [
            item.name,
            item.category,
            item.quantity,
            item.unitPrice,
            stockValue,
            item.reorderLevel,
            status
        ];
    });
    // Escape CSV values safely
    const csvContent = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(","))
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
document.getElementById("exportReport")
    .addEventListener("click", exportInventoryCSV);
    document.getElementById("printReport")
    .addEventListener("click", function () {
        window.print();
    });