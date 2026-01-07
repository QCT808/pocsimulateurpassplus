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

// Paramètres du tarif de restauration scolaire
const TARIF_RESTAURATION = {
  QFM_PLANCHER: 280,
  QFM_PLAFOND: 2000,
  TARIF_PLANCHER: 0.64,
  TARIF_PLAFOND: 7.00
}

// Coefficients de la formule linéaire Y = aX + b
// a = (y2 - y1) / (x2 - x1)
const COEF_A = (TARIF_RESTAURATION.TARIF_PLAFOND - TARIF_RESTAURATION.TARIF_PLANCHER) /
               (TARIF_RESTAURATION.QFM_PLAFOND - TARIF_RESTAURATION.QFM_PLANCHER)
// b = y2 - (x2 * a)
const COEF_B = TARIF_RESTAURATION.TARIF_PLAFOND - (TARIF_RESTAURATION.QFM_PLAFOND * COEF_A)

/**
 * Calcule le tarif de restauration scolaire en fonction du QFM
 *
 * Grille tarifaire :
 * - QFM ≤ 280€ → Tarif plancher = 0,64€
 * - QFM entre 281€ et 2000€ → Formule linéaire Y = aX + b
 * - QFM ≥ 2001€ → Tarif plafond = 7,00€
 *
 * @param {number} qfm - Quotient Familial Mensuel
 * @returns {number} Tarif du repas en euros (arrondi à 2 décimales)
 */
export const calculerTarifRestauration = (qfm) => {
  if (!qfm || qfm <= 0) {
    return TARIF_RESTAURATION.TARIF_PLANCHER
  }

  // QFM ≤ 280€ → Tarif plancher
  if (qfm <= TARIF_RESTAURATION.QFM_PLANCHER) {
    return TARIF_RESTAURATION.TARIF_PLANCHER
  }

  // QFM ≥ 2001€ → Tarif plafond
  if (qfm >= TARIF_RESTAURATION.QFM_PLAFOND + 1) {
    return TARIF_RESTAURATION.TARIF_PLAFOND
  }

  // QFM entre 281€ et 2000€ → Formule linéaire
  const tarif = (COEF_A * qfm) + COEF_B
  return Math.round(tarif * 100) / 100 // Arrondi à 2 décimales
}

/**
 * Retourne les informations détaillées sur le tarif de restauration
 * @param {number} qfm - Quotient Familial Mensuel
 * @returns {Object} Informations sur le tarif
 */
export const getInfosTarifRestauration = (qfm) => {
  const tarif = calculerTarifRestauration(qfm)

  let tranche = ''
  if (!qfm || qfm <= TARIF_RESTAURATION.QFM_PLANCHER) {
    tranche = 'Tarif plancher'
  } else if (qfm >= TARIF_RESTAURATION.QFM_PLAFOND + 1) {
    tranche = 'Tarif plafond'
  } else {
    tranche = 'Taux d\'effort'
  }

  return {
    tarif,
    tarifFormate: tarif.toFixed(2).replace('.', ',') + ' €',
    tranche,
    qfm
  }
}
