// Definição dos dias da semana com seus bits
export const DIAS_SEMANA = [
  { bit: 1,  label: 'Dom', sigla: 'D' },
  { bit: 2,  label: 'Seg', sigla: 'S' },
  { bit: 4,  label: 'Ter', sigla: 'T' },
  { bit: 8,  label: 'Qua', sigla: 'Q' },
  { bit: 16, label: 'Qui', sigla: 'Q' },
  { bit: 32, label: 'Sex', sigla: 'S' },
  { bit: 64, label: 'Sab', sigla: 'S' },
];

/**
 * Converte um array de bits selecionados para o valor bitmask inteiro.
 * @param {number[]} bitsAtivos - Array de bits ativos (ex: [2, 4, 8, 16, 32])
 * @returns {number}
 */
export function toBitmask(bitsAtivos) {
  return (bitsAtivos ?? []).reduce((acc, bit) => acc | bit, 0);
}

/**
 * Converte um bitmask inteiro para array de bits ativos.
 * @param {number|null} mask
 * @returns {number[]}
 */
export function fromBitmask(mask) {
  if (mask == null) return [];
  return DIAS_SEMANA.filter(d => (mask & d.bit) !== 0).map(d => d.bit);
}

/**
 * Formata o bitmask como string legível (ex: "Seg, Ter, Qua").
 * @param {number|null} mask
 * @returns {string}
 */
export function formatDias(mask) {
  if (!mask) return '—';
  return DIAS_SEMANA
    .filter(d => (mask & d.bit) !== 0)
    .map(d => d.label)
    .join(', ');
}
