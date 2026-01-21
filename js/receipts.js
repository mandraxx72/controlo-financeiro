/**
 * CONTROLO FINANCEIRO - Receipts Manager
 * Handles receipt image storage using IndexedDB
 */
const ReceiptsManager = (function () {
    const DB_NAME = 'cf_receipts';
    const DB_VERSION = 1;
    const STORE_NAME = 'receipts';
    let db = null;

    // Initialize IndexedDB
    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('yearMonth', 'yearMonth', { unique: false });
                    store.createIndex('transactionId', 'transactionId', { unique: false });
                }
            };
        });
    }

    // Add a new receipt
    function addReceipt(imageData, date, transactionId = null, note = '') {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const dateObj = new Date(date);
            const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

            const receipt = {
                id: Date.now().toString(),
                imageData: imageData, // Base64 string
                date: date,
                yearMonth: yearMonth,
                transactionId: transactionId,
                note: note,
                createdAt: new Date().toISOString()
            };

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(receipt);

            request.onsuccess = () => resolve(receipt);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all receipts for a specific month
    function getReceiptsByMonth(year, month) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('yearMonth');
            const request = index.getAll(yearMonth);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all receipts grouped by month
    function getAllReceiptsGrouped() {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const receipts = request.result;
                const grouped = {};

                receipts.forEach(r => {
                    if (!grouped[r.yearMonth]) {
                        grouped[r.yearMonth] = [];
                    }
                    grouped[r.yearMonth].push(r);
                });

                // Sort by date within each month
                for (const month in grouped) {
                    grouped[month].sort((a, b) => new Date(b.date) - new Date(a.date));
                }

                resolve(grouped);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get receipt by ID
    function getReceipt(id) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete receipt
    function deleteReceipt(id) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Link receipt to transaction
    function linkToTransaction(receiptId, transactionId) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(receiptId);

            getRequest.onsuccess = () => {
                const receipt = getRequest.result;
                if (receipt) {
                    receipt.transactionId = transactionId;
                    const putRequest = store.put(receipt);
                    putRequest.onsuccess = () => resolve(receipt);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('Receipt not found'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Get receipts for a transaction
    function getReceiptsForTransaction(transactionId) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('transactionId');
            const request = index.getAll(transactionId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get month name helper
    function getMonthName(yearMonth) {
        const [year, month] = yearMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }

    return {
        init,
        addReceipt,
        getReceiptsByMonth,
        getAllReceiptsGrouped,
        getReceipt,
        deleteReceipt,
        linkToTransaction,
        getReceiptsForTransaction,
        getMonthName
    };
})();

// Export
window.ReceiptsManager = ReceiptsManager;
