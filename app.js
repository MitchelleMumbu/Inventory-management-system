const STORAGE_KEY = "inventory-management-items-v1";
const form = document.getElementById("itemForm");
const inventoryBody = document.getElementById("inventoryBody");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");

let items = loadItems();

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function formatMoney(amount) {
  return "KSh " + Number(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = "form-message " + (type || "");
}

function renderInventory() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleItems = items.filter(item => item.name.toLowerCase().includes(searchTerm));

  if (visibleItems.length === 0) {
    inventoryBody.innerHTML = `<tr class="empty-row"><td colspan="6">${
      items.length ? "No items match your search." : "No inventory items yet. Add your first item above."
    }</td></tr>`;
  } else {
    inventoryBody.innerHTML = visibleItems.map(item => {
      const low = InventoryUtils.isLowStock(item.quantity, item.reorderLevel);
      const value = InventoryUtils.calculateStockValue(item.quantity, item.unitPrice);
      return `
        <tr>
          <td class="item-name">${escapeHTML(item.name)}</td>
          <td>${item.quantity}</td>
          <td class="money">${formatMoney(item.unitPrice)}</td>
          <td class="money">${formatMoney(value)}</td>
          <td>${item.reorderLevel}</td>
          <td><span class="stock-badge ${low ? "low" : "ok"}">${low ? "Low stock" : "In stock"}</span></td>
        </tr>`;
    }).join("");
  }

  const summary = InventoryUtils.getInventorySummary(items);
  document.getElementById("itemCount").textContent = items.length;
  document.getElementById("unitCount").textContent = summary.totalUnits.toLocaleString("en-KE");
  document.getElementById("stockValue").textContent = formatMoney(summary.totalValue);
  document.getElementById("lowStockCount").textContent = summary.lowStockItems;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("itemName").value.trim();
  const quantity = Number(document.getElementById("quantity").value);
  const unitPrice = Number(document.getElementById("unitPrice").value);
  const reorderLevel = Number(document.getElementById("reorderLevel").value);

  if (!name || !Number.isInteger(quantity) || quantity < 0 ||
      !Number.isFinite(unitPrice) || unitPrice < 0 ||
      !Number.isInteger(reorderLevel) || reorderLevel < 0) {
    showMessage("Please enter a name, whole-number quantities and valid non-negative prices.", "error");
    return;
  }

  const existingItem = items.find(item => item.name.toLowerCase() === name.toLowerCase());
  if (existingItem) {
    showMessage("That item already exists. Use a different name for this record.", "error");
    return;
  }

  items.push({
    id: Date.now(),
    name,
    quantity,
    unitPrice,
    reorderLevel
  });

  saveItems();
  form.reset();
  document.getElementById("reorderLevel").value = 5;
  showMessage("Item added successfully.", "success");
  renderInventory();
});

searchInput.addEventListener("input", renderInventory);
renderInventory();
