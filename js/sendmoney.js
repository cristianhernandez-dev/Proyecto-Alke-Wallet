$(document).ready(function () {

  // Verificar sesión
  if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
    return;
  }

  let selectedContactIndex = null;

  /* =========================
     HELPERS
  ========================= */
  function getContacts() {
    return JSON.parse(localStorage.getItem('contacts')) || [];
  }

  function setContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
  }

  function setTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
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

  function clearAlert() {
    $('#alert-container').empty();
  }

  function showAlert(message, type) {
    $('#alert-container').html(`
      <div class="alert alert-${type}">
        ${message}
      </div>
    `);
  }

  function renderAvailableBalance() {
    const balance = getSafeBalance();
    $('#availableBalanceLine')
      .removeClass('d-none')
      .text(`Saldo disponible para enviar: $${balance.toLocaleString('es-CL')}`);
  }

  function hideAvailableBalance() {
    $('#availableBalanceLine').addClass('d-none').text('');
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
     RENDER CONTACTOS
  ========================= */
  function renderContacts() {
    const contacts = getContacts();
    $('#contactList').empty();

    if (contacts.length === 0) {
      $('#contactList').html(`
        <li class="list-group-item text-center text-muted">
          No hay contactos guardados
        </li>
      `);
    } else {
      contacts.forEach((c, index) => {
        $('#contactList').append(`
          <li class="list-group-item contact-item" data-index="${index}">
            <strong>${c.name}</strong><br>
            <small class="text-muted">Alias: ${c.alias} • ${c.bank}</small>
          </li>
        `);
      });
    }

    // reset UI
    $('#btnSendMoney').addClass('d-none');
    $('.contact-item').removeClass('active');
    selectedContactIndex = null;
    hideAvailableBalance();
  }

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

    const contacts = getContacts();

    // Evitar duplicados por nombre o alias (opcional pero útil)
    const exists = contacts.some(c =>
      c.name.toLowerCase() === name.toLowerCase() ||
      c.alias.toLowerCase() === alias.toLowerCase()
    );

    if (exists) {
      showAlert('Ese contacto (nombre o alias) ya existe.', 'warning');
      return;
    }

    contacts.push({ name, cbu, alias, bank });
    setContacts(contacts);

    $('#contactForm')[0].reset();
    $('#newContactForm').addClass('d-none');

    renderContacts();
    setupAutocomplete(); // refresca sugerencias con contactos nuevos

    showAlert('Contacto agregado correctamente', 'success');
    setTimeout(() => clearAlert(), 2500);
  });

  /* =========================
     SELECCIONAR CONTACTO (lista)
  ========================= */
  $(document).on('click', '.contact-item', function () {
    // Evitar seleccionar el placeholder "no hay contactos"
    if ($(this).find('.text-muted').length === 0 && $(this).hasClass('text-muted')) return;

    $('.contact-item').removeClass('active');
    $(this).addClass('active');

    selectedContactIndex = Number($(this).data('index'));
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

    const contacts = getContacts();
    const contact = contacts[selectedContactIndex];

    if (!contact) {
      showAlert('Contacto inválido. Selecciona nuevamente.', 'danger');
      renderContacts();
      return;
    }

    let balance = getSafeBalance();
    if (amount > balance) {
      showAlert('Saldo insuficiente', 'danger');
      return;
    }

    balance -= amount;
    setSafeBalance(balance);

    const transactions = getTransactions();
    transactions.push({
      type: 'transfer',
      amount: amount,
      to: contact.name,
      date: new Date().toLocaleString('es-CL')
    });
    setTransactions(transactions);

    showAlert(`Envío realizado a ${contact.name}`, 'success');
    renderAvailableBalance();

    // auto-ocultar alerta para que no quede pegada
    setTimeout(() => clearAlert(), 3000);

    // reset selección
    $('#btnSendMoney').addClass('d-none');
    selectedContactIndex = null;
    $('.contact-item').removeClass('active');
  });

  /* =========================
     AUTOCOMPLETE (PREFIJO)
     - Busca por nombre o alias (campo #contactSearch)
     - Sugerencias por prefijo (startsWith)
     - Además aplica autocomplete al campo #contactName del formulario
  ========================= */
  function setupAutocomplete() {
    // 1) Buscador: seleccionar destinatario (nombre o alias)
    $('#contactSearch').autocomplete({
      minLength: 1,
      source: function (request, response) {
        const term = (request.term || '').toLowerCase();
        const contacts = getContacts();

        const matches = contacts
          .map((c, index) => ({
            label: `${c.name} (${c.alias})`,
            value: c.name,
            index,
            name: c.name,
            alias: c.alias
          }))
          .filter(item =>
            item.name.toLowerCase().startsWith(term) ||
            item.alias.toLowerCase().startsWith(term)
          );

        response(matches);
      },
      select: function (event, ui) {
        if (ui?.item?.index !== undefined) {
          selectedContactIndex = ui.item.index;

          $('.contact-item').removeClass('active');
          $(`.contact-item[data-index="${selectedContactIndex}"]`).addClass('active');

          $('#btnSendMoney').removeClass('d-none');
          clearAlert();
          renderAvailableBalance();
        }

        $('#contactSearch').val('');
        return false;
      }
    });

    // 2) Formulario: sugerir nombres existentes por prefijo (como pidió la profe)
    $('#contactName').autocomplete({
      minLength: 1,
      source: function (request, response) {
        const term = (request.term || '').toLowerCase();
        const contacts = getContacts();

        const matches = contacts
          .map(c => ({
            label: c.name,
            value: c.name,
            cbu: c.cbu,
            alias: c.alias,
            bank: c.bank
          }))
          .filter(item => item.value.toLowerCase().startsWith(term));

        response(matches);
      },
      select: function (event, ui) {
        // opcional: autocompletar campos si elige un contacto existente
        if (ui?.item) {
          $('#contactName').val(ui.item.value);
          $('#contactCBU').val(ui.item.cbu || '');
          $('#contactAlias').val(ui.item.alias || '');
          $('#contactBank').val(ui.item.bank || '');
        }
        return false;
      }
    });
  }

  // Inicializar pantalla
  renderContacts();
  setupAutocomplete();
});
