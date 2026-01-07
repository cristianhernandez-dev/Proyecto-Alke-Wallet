$(document).ready(function () {

  // Verificar sesión
  if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
    return;
  }

  // Lectura segura del saldo (evita NaN si llega con "$" u otro texto)
  const raw = localStorage.getItem('balance');
  const cleaned = (raw ?? '').toString().replace(/[^\d.-]/g, '');
  let balance = Number(cleaned);
  if (!Number.isFinite(balance)) {
    balance = 900000;
    localStorage.setItem('balance', balance.toString());
  }
  $('#balance').text(`$${balance.toLocaleString('es-CL')}`);

  function goWithLoading($btn, message, url) {
    $('#message').text(message);

    // guardar texto original
    const originalText = $btn.text().trim();

    // aplicar loading
    $btn.addClass('btn-loading');
    $btn.html(`${originalText}<span class="btn-spinner"></span>`);

    setTimeout(() => {
      window.location.href = url;
    }, 700); // loading breve + spinner (micro-interacción)
  }

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
