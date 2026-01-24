$(document).ready(function () {
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (email === 'alumno@wallet.cl' && password === '123456') {
      localStorage.setItem('isLogged', 'true');

      if (!localStorage.getItem('balance')) {
        localStorage.setItem('balance', '900000');
      }
      if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
      }
      if (!localStorage.getItem('contacts')) {
        localStorage.setItem('contacts', JSON.stringify([
          { name: 'Jonatan Hernández', cbu: '0000000000000000000001', alias: 'jonatan.h', bank: 'Banco de Chile' },
          { name: 'Natalia Sánchez', cbu: '0000000000000000000002', alias: 'natalia.s', bank: 'Banco del Estado' },
          { name: 'Cristian Hernández', cbu: '0000000000000000000004', alias: 'cristian.h', bank: 'Banco del Estado' },          
          { name: 'Gabriela Poblete', cbu: '0000000000000000000003', alias: 'gabriela.p', bank: 'Banco Santander' }      
        ]));
      }

      $('#alert-container').html(`
        <div class="alert alert-success">Login exitoso. Redirigiendo...</div>
      `);

      setTimeout(() => window.location.href = 'menu.html', 1000);
    } else {
      $('#alert-container').html(`
        <div class="alert alert-danger">Usuario o contraseña incorrectos</div>
      `);
    }
  });
});
