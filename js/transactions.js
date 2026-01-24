// Verificar sesión
if (!localStorage.getItem('isLogged')) {
  window.location.href = 'login.html';
}

// Leer siempre desde localStorage para evitar valores stale
function getTransactions() {
  return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Etiqueta legible
function getTransactionLabel(t) {
  if (t.type === 'deposit') return 'Depósito';
  if (t.type === 'transfer') return `Transferencia a ${t.to ?? 'Contacto'}`;
  return 'Movimiento';
}

// Mostrar transacciones
function renderTransactions(filter = 'all') {
  const transactions = getTransactions();
  $('#transactionList').empty();

  const filtered = (filter === 'all')
    ? transactions
    : transactions.filter(t => t.type === filter);

  if (filtered.length === 0) {
    $('#transactionList').html(`
      <li class="list-group-item text-center text-muted">
        No hay movimientos registrados
      </li>
    `);
    return;
  }

  filtered.forEach(t => {
    const label = getTransactionLabel(t);
    const amount = Number(t.amount); // por si llega como string

    $('#transactionList').append(`
      <li class="list-group-item d-flex justify-content-between align-items-start">
        <div>
          <strong>${label}</strong><br>
          <small class="text-muted">${t.date ?? ''}</small>
        </div>
        <span class="fw-semibold">$${Number.isFinite(amount) ? amount.toLocaleString('es-CL') : t.amount}</span>
      </li>
    `);
  });
}

// Filtro
$('#filterType').on('change', function () {
  renderTransactions($(this).val());
});

// Inicializar
renderTransactions('all');
