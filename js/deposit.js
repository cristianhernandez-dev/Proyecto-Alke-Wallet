// Verificar sesión
if (!localStorage.getItem('isLogged')) {
    window.location.href = 'login.html';
}

// Mostrar saldo actual
$('#currentBalance').text(`$${Number(localStorage.getItem('balance') || 0).toLocaleString('es-CL')}`);


$('#depositForm').submit(function (e) {
    e.preventDefault();

    const amount = Number($('#depositAmount').val());

    // Alerta de valor
    if (amount <= 0) {
        $('#alert-container').html(`
            <div class="alert alert-danger">
                Monto inválido
            </div>
        `);
        return;
    }

    let balance = Number(localStorage.getItem('balance'));
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    balance += amount;

    transactions.push({
        type: 'deposit',
        amount: amount,
        date: new Date().toLocaleString()
    });

    localStorage.setItem('balance', balance.toString());
    localStorage.setItem('transactions', JSON.stringify(transactions));

    $('#alert-container').html(`
        <div class="alert alert-success">
            Depósito realizado con éxito. Monto depositado: $${amount}
        </div>
    `);

    setTimeout(() => {
    window.location.href = 'transactions.html';
}, 2000);
});
