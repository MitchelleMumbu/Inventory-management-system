/*
 * Shared inventory functions.
 * Browser: available as window.InventoryUtils
 * Node.js: available through require("./inventory.js")
 */
(function (root, factory) {
  const utils = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = utils;
  } else {
    root.InventoryUtils = utils;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function calculateStockValue(quantity, unitPrice) {
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (!Number.isFinite(qty) || !Number.isFinite(price) || qty < 0 || price < 0) {
      throw new Error("Quantity and unit price must be valid non-negative numbers.");
    }
    return qty * price;
  }

  function isLowStock(quantity, reorderLevel) {
    const qty = Number(quantity);
    const level = Number(reorderLevel);
    if (!Number.isFinite(qty) || !Number.isFinite(level) || qty < 0 || level < 0) {
      throw new Error("Quantity and reorder level must be valid non-negative numbers.");
    }
    return qty <= level;
  }

  function getInventorySummary(items) {
    return items.reduce(function (summary, item) {
      summary.totalUnits += Number(item.quantity);
      summary.totalValue += calculateStockValue(item.quantity, item.unitPrice);
      if (isLowStock(item.quantity, item.reorderLevel)) summary.lowStockItems += 1;
      return summary;
    }, { totalUnits: 0, totalValue: 0, lowStockItems: 0 });
  }

  return { calculateStockValue, isLowStock, getInventorySummary };
}));
