/**
 * Convierte "HH:mm" a minutos desde las 00:00 (más fácil de comparar).
 */
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos desde las 00:00 de vuelta a "HH:mm".
 */
function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Suma una cantidad de horas a un horario "HH:mm" y devuelve el nuevo "HH:mm".
 */
function addHours(hhmm, hours) {
  return minutesToTime(timeToMinutes(hhmm) + hours * 60);
}

/**
 * true si el rango [startA, endA) se superpone con [startB, endB).
 * Los cuatro valores son "HH:mm".
 */
function rangesOverlap(startA, endA, startB, endB) {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return a1 < b2 && b1 < a2;
}

module.exports = { timeToMinutes, minutesToTime, addHours, rangesOverlap };
