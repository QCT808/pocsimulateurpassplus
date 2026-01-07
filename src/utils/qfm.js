/**
 * Calcul du Quotient Familial Mensuel (QFM)
 *
 * Formule : QFM = revenus_annuels / 12 / nombre_de_parts
 *
 * Le nombre de parts est saisi directement par l'utilisateur
 * (correspond au nombre de parts fiscales de l'avis d'imposition)
 */

/**
 * Calcule le QFM (Quotient Familial Mensuel)
 * @param {number} revenusAnnuels - Revenus annuels du foyer en euros
 * @param {number} nombreParts - Nombre de parts fiscales du foyer
 * @returns {number} QFM arrondi à l'entier
 */
export const calculerQFM = (revenusAnnuels, nombreParts) => {
  if (!revenusAnnuels || revenusAnnuels <= 0 || !nombreParts || nombreParts <= 0) {
    return 0
  }

  const revenusMensuels = revenusAnnuels / 12
  const qfm = revenusMensuels / nombreParts

  return Math.round(qfm)
}

// Seuils de QFM pour les différentes aides
export const SEUIL_QFM_RESTAURATION = 2000
export const SEUIL_QFM_ORDINATEUR = 880
