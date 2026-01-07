/**
 * Logique métier d'éligibilité aux aides Pass+
 */

import { isCollegeDansListe } from '../data/colleges'
import { isDepartement92 } from '../data/departements'
import { SEUIL_QFM_RESTAURATION, SEUIL_QFM_ORDINATEUR, calculerTarifRestauration } from './qfm'

/**
 * Vérifie si l'enfant est collégien
 */
export const estCollegien = (enfant) => {
  return enfant.niveauScolaire === 'college'
}

/**
 * Vérifie si l'enfant réside dans le 92
 */
export const estResident92 = (enfant, foyerDepartement) => {
  if (enfant.resideChezResponsable) {
    return isDepartement92(foyerDepartement)
  }
  return isDepartement92(enfant.departementResidence)
}

/**
 * Vérifie si l'enfant est scolarisé dans le 92
 */
export const estScolarise92 = (enfant) => {
  if (enfant.etablissement && isCollegeDansListe(enfant.etablissement)) {
    return true
  }
  return isDepartement92(enfant.departementScolarisation)
}

/**
 * Vérifie si l'enfant mange dans un établissement de la liste
 */
export const mangeDansEtablissementListe = (enfant) => {
  // Si scolarisé dans un établissement de la liste, on considère qu'il y mange
  if (enfant.etablissement && isCollegeDansListe(enfant.etablissement)) {
    return true
  }
  // Sinon, on vérifie s'il mange à la cantine d'un établissement de la liste
  // Il faut que cantineDansListe soit true ET que collegeCantine soit un collège de la liste (pas 'autre')
  if (enfant.cantineDansListe === true && enfant.collegeCantine) {
    return isCollegeDansListe(enfant.collegeCantine)
  }
  return false
}

/**
 * 6.1 Aide financière Pass+ — 80 €
 * Éligible si : Collégien ET (résident OU scolarisé dans le 92)
 */
export const calculerAideFinanciere = (enfant, foyerDepartement) => {
  if (!estCollegien(enfant)) {
    return { eligible: false, raison: 'Non collégien' }
  }

  const resident92 = estResident92(enfant, foyerDepartement)
  const scolarise92 = estScolarise92(enfant)

  if (!resident92 && !scolarise92) {
    return {
      eligible: false,
      raison: 'Ni résident ni scolarisé dans les Hauts-de-Seine (92)'
    }
  }

  const criteres = []
  if (resident92) criteres.push('Résident dans le 92')
  if (scolarise92) criteres.push('Scolarisé dans le 92')

  return {
    eligible: true,
    montant: 80,
    criteres
  }
}

/**
 * 6.2 Bonus bourse / ASE — +20 €
 * Éligible si : Éligible à l'aide financière ET (boursier OU ASE)
 */
export const calculerBonusBourseASE = (enfant, foyerDepartement) => {
  const aideFinanciere = calculerAideFinanciere(enfant, foyerDepartement)

  if (!aideFinanciere.eligible) {
    return { eligible: false, raison: 'Non éligible à l\'aide financière de base' }
  }

  if (!enfant.estBoursier && !enfant.estASE) {
    return { eligible: false, raison: 'Ni boursier ni rattaché à l\'ASE' }
  }

  const criteres = []
  if (enfant.estBoursier) criteres.push('Enfant boursier')
  if (enfant.estASE) criteres.push('Rattaché à l\'ASE')

  return {
    eligible: true,
    montant: 20,
    criteres
  }
}

/**
 * 6.3 Réduction du tarif de la restauration scolaire
 * Éligible si :
 * - Résident dans le 92
 * - ET (scolarisé dans établissement liste OU mange cantine établissement liste)
 * - ET (QFM < 2000 OU ASE)
 *
 * Non éligible si scolarisé dans le 92 mais non résident
 */
export const calculerReductionRestauration = (enfant, foyerDepartement, qfm, situationParticuliere) => {
  if (!estCollegien(enfant)) {
    return { eligible: false, raison: 'Non collégien' }
  }

  const resident92 = estResident92(enfant, foyerDepartement)

  if (!resident92) {
    return {
      eligible: false,
      raison: 'Non résident dans les Hauts-de-Seine (92)'
    }
  }

  const dansEtablissementListe = mangeDansEtablissementListe(enfant)

  if (!dansEtablissementListe) {
    return {
      eligible: false,
      raison: 'Ne mange pas dans un établissement de la liste'
    }
  }

  // Vérification QFM ou ASE
  // Si situation particulière, on considère le QFM comme compatible
  const qfmCompatible = situationParticuliere !== 'aucune' || qfm < SEUIL_QFM_RESTAURATION

  if (!qfmCompatible && !enfant.estASE) {
    return {
      eligible: false,
      raison: `QFM (${qfm}€) supérieur au seuil de ${SEUIL_QFM_RESTAURATION}€ et non rattaché à l'ASE`
    }
  }

  const criteres = ['Résident dans le 92', 'Établissement éligible']
  if (enfant.estASE) {
    criteres.push('Rattaché à l\'ASE')
  } else if (situationParticuliere !== 'aucune') {
    criteres.push('Situation particulière')
  }

  // Calcul du tarif de restauration
  // Pour les situations particulières ou ASE, on applique le tarif plancher
  const qfmPourTarif = (situationParticuliere !== 'aucune' || enfant.estASE) ? 0 : qfm
  const tarifRepas = calculerTarifRestauration(qfmPourTarif)

  return {
    eligible: true,
    criteres,
    tarifRepas,
    tarifRepasFormate: tarifRepas.toFixed(2).replace('.', ',') + ' €'
  }
}

/**
 * 6.4 Remboursement partiel du Pass Imagine R
 * Éligible si : Résident dans le 92 ET boursier ET souhaite utiliser le Pass Imagine R
 */
export const calculerRemboursementImagineR = (enfant, foyerDepartement) => {
  if (!estCollegien(enfant)) {
    return { eligible: false, raison: 'Non collégien' }
  }

  const resident92 = estResident92(enfant, foyerDepartement)

  if (!resident92) {
    return { eligible: false, raison: 'Non résident dans le 92' }
  }

  if (!enfant.estBoursier) {
    return { eligible: false, raison: 'Non boursier' }
  }

  if (!enfant.souhaiteImagineR) {
    return { eligible: false, raison: 'Ne souhaite pas utiliser le Pass Imagine R' }
  }

  return {
    eligible: true,
    criteres: ['Résident dans le 92', 'Boursier', 'Utilise le Pass Imagine R']
  }
}

/**
 * 6.5 Don d'ordinateur
 * Éligible si :
 * - Collégien
 * - ET (résident OU scolarisé dans le 92)
 * - ET (QFM < 880 OU boursier OU ASE)
 */
export const calculerDonOrdinateur = (enfant, foyerDepartement, qfm, situationParticuliere) => {
  if (!estCollegien(enfant)) {
    return { eligible: false, raison: 'Non collégien' }
  }

  const resident92 = estResident92(enfant, foyerDepartement)
  const scolarise92 = estScolarise92(enfant)

  if (!resident92 && !scolarise92) {
    return {
      eligible: false,
      raison: 'Ni résident ni scolarisé dans le 92'
    }
  }

  // Vérification QFM, bourse ou ASE
  // Si situation particulière, on considère le QFM comme compatible
  const qfmCompatible = situationParticuliere !== 'aucune' || qfm < SEUIL_QFM_ORDINATEUR

  if (!qfmCompatible && !enfant.estBoursier && !enfant.estASE) {
    return {
      eligible: false,
      raison: `QFM (${qfm}€) supérieur au seuil de ${SEUIL_QFM_ORDINATEUR}€, non boursier et non rattaché à l'ASE`
    }
  }

  const criteres = []
  if (resident92) criteres.push('Résident dans le 92')
  if (scolarise92) criteres.push('Scolarisé dans le 92')

  if (enfant.estASE) {
    criteres.push('Rattaché à l\'ASE')
  } else if (enfant.estBoursier) {
    criteres.push('Boursier')
  } else if (situationParticuliere !== 'aucune') {
    criteres.push('Situation particulière')
  } else {
    criteres.push(`QFM (${qfm}€) < ${SEUIL_QFM_ORDINATEUR}€`)
  }

  return {
    eligible: true,
    criteres
  }
}

/**
 * Calcule toutes les aides pour un enfant
 */
export const calculerToutesAides = (enfant, foyer, qfm) => {
  const { departement, situationParticuliere } = foyer

  const aides = {
    aideFinanciere: calculerAideFinanciere(enfant, departement),
    bonusBourseASE: calculerBonusBourseASE(enfant, departement),
    reductionRestauration: calculerReductionRestauration(enfant, departement, qfm, situationParticuliere),
    remboursementImagineR: calculerRemboursementImagineR(enfant, departement),
    donOrdinateur: calculerDonOrdinateur(enfant, departement, qfm, situationParticuliere)
  }

  // Calcul du montant total
  let montantTotal = 0
  if (aides.aideFinanciere.eligible) {
    montantTotal += aides.aideFinanciere.montant
  }
  if (aides.bonusBourseASE.eligible) {
    montantTotal += aides.bonusBourseASE.montant
  }

  return {
    ...aides,
    montantTotal,
    auMoinsUneAide: Object.values(aides).some(a => a.eligible)
  }
}
