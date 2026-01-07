$(document).ready(function () {

  // Verificar sesión
  if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
    return;
  }

  function getSafeBalance() {
    const raw = localStorage.getItem('balance');
    const cleaned = (raw ?? '').toString().replace(/[^\d.-]/g, '');
    const balance = Number(cleaned);
    return Number.isFinite(balance) ? balance : 0;
  }

  function setSafeBalance(value) {
    const num = Number(value);
    localStorage.setItem('balance', Number.isFinite(num) ? num.toString() : '0');
  }

  function showAlert(message, type) {
    $('#alert-container').html(`
      <div class="alert alert-${type}">
        ${message}
      </div>
    `);
  }

  // Mostrar saldo actual
  const currentBalance = getSafeBalance();
  $('#currentBalance').text(`$${currentBalance.toLocaleString('es-CL')}`);

  // Evento depósito
  $('#depositForm').on('submit', function (e) {
    e.preventDefault();

    const amount = Number($('#depositAmount').val()); // ✅ ID correcto

    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert('Ingresa un monto válido.', 'danger');
      return;
    }

    const balance = getSafeBalance() + amount;
    setSafeBalance(balance);

    // Registrar transacción
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push({
      type: 'deposit',
      amount: amount,
      date: new Date().toLocaleString('es-CL')
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    showAlert(`Depósito realizado por $${amount.toLocaleString('es-CL')}. Redirigiendo...`, 'success');

    // Redirigir a movimientos (mejor UX para ver el resultado)
    setTimeout(() => {
      window.location.href = 'transactions.html';
    }, 1200);
  });

});
