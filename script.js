// DOM Elements
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const transactionListEl = document.getElementById('transaction-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const noTransactionsEl = document.getElementById('no-transactions');

// Load transactions from localStorage or initialize empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);
searchInput.addEventListener('input', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);

// Format number to currency
function formatCurrency(number) {
    return '$' + Math.abs(number).toFixed(2);
}

// Add Transaction function
function addTransaction(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    let amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;

    if (!description || isNaN(amount)) return;

    // Adjust amount sign based on type selection
    if (type === 'expense' && amount > 0) {
        amount = -amount;
    } else if (type === 'income' && amount < 0) {
        amount = Math.abs(amount);
    }

    const newTransaction = {
        id: crypto.randomUUID(),
        description,
        amount,
        category,
        type: amount >= 0 ? 'income' : 'expense'
    };

    transactions.push(newTransaction);
    updateLocalStorage();
    init();

    // Reset form
    transactionForm.reset();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    updateLocalStorage();
    init();
}

// Update LocalStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Summary Statistics
function updateValues() {
    const amounts = transactions.map(item => item.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => acc + item, 0);
    const expense = amounts
        .filter(item => item < 0)
        .reduce((acc, item) => acc + item, 0);

    balanceEl.innerText = `${total < 0 ? '-' : ''}${formatCurrency(total)}`;
    incomeEl.innerText = formatCurrency(income);
    expenseEl.innerText = formatCurrency(expense);

    // Color code balance card
    balanceEl.style.color = total < 0 ? 'var(--danger)' : 'var(--text-main)';
}

// Render Transactions Table with Search and Filtering
function renderTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    // Filter logic
    const filteredTransactions = transactions.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    transactionListEl.innerHTML = '';

    if (filteredTransactions.length === 0) {
        noTransactionsEl.classList.remove('hidden');
        return;
    } else {
        noTransactionsEl.classList.add('hidden');
    }

    filteredTransactions.forEach(item => {
        const sign = item.amount < 0 ? '-' : '+';
        const classType = item.amount < 0 ? 'amount-expense' : 'amount-income';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td><span class="badge">${item.category}</span></td>
            <td class="${classType}">${sign}${formatCurrency(item.amount)}</td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction('${item.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        transactionListEl.appendChild(row);
    });
}

// Initialize App
function init() {
    renderTransactions();
    updateValues();
}

init();
