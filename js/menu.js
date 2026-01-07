$(document).ready(function () {

  // Verificar sesión
  if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
    return;
  }

  // Lectura segura del saldo (evita NaN si llega con "$" u otro texto)
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

  // Reparar si viene malo y mostrar
  let balance = getSafeBalance();
  if (!Number.isFinite(balance) || balance < 0) {
    balance = 900000;
    setSafeBalance(balance);
  }
  $('#balance').text(`$${balance.toLocaleString('es-CL')}`);

  // Micro-interacción: loading breve + spinner
  function goWithLoading($btn, message, url) {
    $('#message').text(message);

    const originalText = $btn.text().trim();
    $btn.addClass('btn-loading');
    $btn.html(`${originalText}<span class="btn-spinner"></span>`);

    setTimeout(() => {
      window.location.href = url;
    }, 700);
  }

  // Botones
  $('#btnDeposit').on('click', function () {
    goWithLoading($(this), 'Redirigiendo a depósito...', 'deposit.html');
  });

  $('#btnSendMoney').on('click', function () {
    goWithLoading($(this), 'Redirigiendo a enviar dinero...', 'sendmoney.html');
  });

  $('#btnTransactions').on('click', function () {
    goWithLoading($(this), 'Redirigiendo a últimos movimientos...', 'transactions.html');
  });

});
