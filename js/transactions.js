$(document).ready(function () {

  // Verificar sesión
  if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
    return;
  }

  function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
  }

  function getLabel(t) {
    if (t.type === 'deposit') return 'Depósito';
    if (t.type === 'transfer') return `Transferencia a ${t.to ?? 'Contacto'}`;
    return 'Movimiento';
  }

  function formatAmount(amount) {
    const num = Number(amount);
    return Number.isFinite(num) ? `$${num.toLocaleString('es-CL')}` : `$${amount}`;
  }

  function renderTransactions(filter = 'all') {
    const all = getTransactions();
    $('#transactionList').empty();

    const filtered = (filter === 'all') ? all : all.filter(t => t.type === filter);

    if (filtered.length === 0) {
      $('#transactionList').html(`
        <li class="list-group-item text-center text-muted">
          No hay movimientos registrados
        </li>
      `);
      return;
    }

    filtered
      .slice()
      .reverse() // últimos arriba
      .forEach(t => {
        $('#transactionList').append(`
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <strong>${getLabel(t)}</strong><br>
              <small class="text-muted">${t.date ?? ''}</small>
            </div>
            <span class="fw-semibold">${formatAmount(t.amount)}</span>
          </li>
        `);
      });
  }

  // Evento filtro
  $('#filterType').on('change', function () {
    renderTransactions($(this).val());
  });

  // Inicial
  renderTransactions('all');

});
