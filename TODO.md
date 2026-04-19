# Task: Display actual table name instead of ID in sales displays

## Steps to complete:

### 1. ✅ Understand source of sale & table data
- sale from AppContext sales array
- table.name from AppContext tables array, matched by tableId

### 2. ✅ Plan approved by user

### 3. ✅ Add helper function to get table name
- Add `getTableName(sale, tables)` function

### 4. ✅ Update Dashboard.tsx
- Replace `Mesa ${sale.tableId}` with `Mesa ${getTableName(sale, tables)}`
- Update recentActivity rendering

### 5. ✅ Update CashRegister.tsx
- Replace hardcoded `Mesa {sale.tableId}` with dynamic name

### 6. ✅ Test changes
- Verify table names display correctly
- Check fallback for missing tables

### 7. ✅ Table names fixed in sales displays

### 8. ✅ Make Export button functional in CashRegister.tsx
- Generate CSV with daily table rents + sales  
- Include columns: Date, Type, Mesa, Productos, Tiempo, Total
- Download as `corte_caja_YYYY-MM-DD.csv`

### 9. ✅ Layout updated to vertical full-width sales list below stats

### 10. 🎉 All complete

