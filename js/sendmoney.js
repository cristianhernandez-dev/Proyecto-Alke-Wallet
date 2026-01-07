$(document).ready(function () {

  let selectedContactIndex = null;

  /* =========================
     HELPERS
  ========================= */
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

  function clearAlert() {
    $('#alert-container').empty();
  }

  function renderAvailableBalance() {
    const balance = getSafeBalance();
    $('#availableBalanceLine')
      .removeClass('d-none')
      .text(`Saldo disponible para enviar: $${balance.toLocaleString('es-CL')}`);
  }

  /* =========================
     MOSTRAR / OCULTAR FORM
  ========================= */
  $('#btnAddContact').on('click', function () {
    $('#newContactForm').removeClass('d-none');
    clearAlert();
  });

  $('#btnCancelContact').on('click', function () {
    $('#newContactForm').addClass('d-none');
    clearAlert();
  });

  /* =========================
     GUARDAR CONTACTO
  ========================= */
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();

    const name = $('#contactName').val().trim();
    const cbu = $('#contactCBU').val().trim();
    const alias = $('#contactAlias').val().trim();
    const bank = $('#contactBank').val().trim();

    if (!name || !cbu || !alias || !bank) {
      showAlert('Completa todos los campos', 'danger');
      return;
    }

    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.push({ name, cbu, alias, bank });
    localStorage.setItem('contacts', JSON.stringify(contacts));

    $('#contactForm')[0].reset();
    $('#newContactForm').addClass('d-none');

    renderContacts();
    showAlert('Contacto agregado correctamente', 'success');

    // opcional: auto-limpiar alerta
    setTimeout(() => clearAlert(), 2500);
  });

  /* =========================
     RENDER CONTACTOS
  ========================= */
  function renderContacts() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    $('#contactList').empty();

    contacts.forEach((c, index) => {
      $('#contactList').append(`
        <li class="list-group-item contact-item" data-index="${index}">
          <strong>${c.name}</strong><br>
          <small class="text-muted">Alias: ${c.alias} • ${c.bank}</small>
        </li>
      `);
    });

    // reset selección / UI
    $('#btnSendMoney').addClass('d-none');
    selectedContactIndex = null;

    $('#availableBalanceLine').addClass('d-none').text('');
    clearAlert();
  }

  /* =========================
     SELECCIONAR CONTACTO
  ========================= */
  $(document).on('click', '.contact-item', function () {
    $('.contact-item').removeClass('active');
    $(this).addClass('active');

    selectedContactIndex = $(this).data('index');
    $('#btnSendMoney').removeClass('d-none');

    clearAlert();
    renderAvailableBalance();
  });

  /* =========================
     ENVIAR DINERO
  ========================= */
  $('#btnSendMoney').on('click', function () {

    if (selectedContactIndex === null) {
      showAlert('Selecciona un contacto antes de enviar.', 'warning');
      return;
    }

    const amountRaw = prompt('Ingrese el monto a enviar');
    const amount = Number((amountRaw ?? '').toString().replace(/[^\d.-]/g, ''));

    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert('Monto inválido', 'danger');
      return;
    }

    let balance = getSafeBalance();

    if (amount > balance) {
      showAlert('Saldo insuficiente', 'danger');
      return;
    }

    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contact = contacts[selectedContactIndex];

    // descontar saldo y guardar seguro
    balance -= amount;
    setSafeBalance(balance);

    // registrar transacción
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push({
      type: 'transfer',
      amount: amount,
      to: contact?.name ?? 'Contacto',
      date: new Date().toLocaleString('es-CL')
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    showAlert(`Envío realizado a ${contact?.name ?? 'Contacto'}`, 'success');

    // actualizar línea de saldo
    renderAvailableBalance();

    // ocultar aviso para que no quede pegado
    setTimeout(() => {
      clearAlert();
    }, 3000);

    // opcional: ocultar botón hasta seleccionar nuevamente
    $('#btnSendMoney').addClass('d-none');
    selectedContactIndex = null;
    $('.contact-item').removeClass('active');
  });

  /* =========================
     ALERTAS
  ========================= */
  function showAlert(message, type) {
    $('#alert-container').html(`
      <div class="alert alert-${type}">
        ${message}
      </div>
    `);
  }

  // Inicializar
  renderContacts();
});
