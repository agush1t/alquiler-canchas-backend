(function () {
  const socket = io();
  const statusBadge = document.getElementById('connection-status');
  const canchasBody = document.getElementById('canchas-tbody');
  const reservasBody = document.getElementById('reservas-tbody');
  const today = window.TODAY;

  function setStatus(connected) {
    if (!statusBadge) return;
    statusBadge.textContent = connected ? 'en vivo' : 'desconectado';
    statusBadge.className = 'badge ' + (connected ? 'badge--online' : 'badge--offline');
  }

  function removeEmptyRow(tbody) {
    const row = tbody && tbody.querySelector('tr td[colspan]');
    if (row) row.closest('tr').remove();
  }

  function flash(row) {
    row.classList.remove('flash');
    void row.offsetWidth; // fuerza reflow para re-disparar la animación
    row.classList.add('flash');
  }

  function canchaRowHtml(cancha) {
    const activeBadge = cancha.isActive
      ? '<span class="badge badge--online">activa</span>'
      : '<span class="badge badge--offline">inactiva</span>';
    return `
      <td>${cancha.name}</td>
      <td>${cancha.sportType}</td>
      <td>${cancha.location}</td>
      <td>$${cancha.pricePerHour}</td>
      <td>${cancha.openingHour}:00 - ${cancha.closingHour}:00</td>
      <td>${activeBadge}</td>
    `;
  }

  function reservaRowHtml(reserva) {
    const canchasTxt = reserva.canchas
      .map((c) => `${(c.cancha && c.cancha.name) || c.cancha}(${c.quantity}h)`)
      .join(', ');
    return `
      <td>${reserva.clientName}</td>
      <td>${reserva.startTime}</td>
      <td>${canchasTxt}</td>
      <td><span class="badge badge--pending">${reserva.status}</span></td>
    `;
  }

  socket.on('connect', () => setStatus(true));
  socket.on('disconnect', () => setStatus(false));

  socket.on('cancha:created', (cancha) => {
    if (!canchasBody) return;
    removeEmptyRow(canchasBody);
    const row = document.createElement('tr');
    row.id = `cancha-${cancha._id}`;
    row.innerHTML = canchaRowHtml(cancha);
    canchasBody.prepend(row);
    flash(row);
  });

  socket.on('cancha:updated', (cancha) => {
    const row = document.getElementById(`cancha-${cancha._id}`);
    if (row) {
      row.innerHTML = canchaRowHtml(cancha);
      flash(row);
    }
  });

  socket.on('cancha:deleted', ({ _id }) => {
    const row = document.getElementById(`cancha-${_id}`);
    if (row) row.remove();
  });

  // Cuando se crea una reserva para HOY, la agregamos a la tabla de abajo sin recargar
  socket.on('reserva:created', (reserva) => {
    if (!reservasBody || reserva.date !== today) return;
    removeEmptyRow(reservasBody);
    const row = document.createElement('tr');
    row.id = `reserva-${reserva._id}`;
    row.innerHTML = reservaRowHtml(reserva);
    reservasBody.prepend(row);
    flash(row);
  });

  socket.on('reserva:statusChanged', (reserva) => {
    const row = document.getElementById(`reserva-${reserva._id}`);
    if (row) {
      row.innerHTML = reservaRowHtml(reserva);
      flash(row);
    }
  });
})();
