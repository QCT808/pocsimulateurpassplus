/**
 * Détermination des pièces justificatives à fournir
 * en fonction des aides accordées et de la situation
 */

import { isCollegeDansListe } from '../data/colleges'

/**
 * Catégories de justificatifs
 */
export const CATEGORIES = {
  COMMUN: 'Justificatifs communs',
  SCOLARITE: 'Justificatifs de scolarité',
  REVENUS: 'Justificatifs de revenus et composition familiale',
  SITUATION: 'Situation particulière',
  BOURSE_ASE: 'Bourse / ASE',
  IMAGINE_R: 'Pass Imagine R'
}

/**
 * Liste de tous les justificatifs possibles
 */
export const JUSTIFICATIFS = {
  PHOTO_ENFANT: {
    id: 'photo_enfant',
    nom: 'Photo de l\'enfant',
    categorie: CATEGORIES.COMMUN
  },
  JUSTIFICATIF_SCOLARITE: {
    id: 'justificatif_scolarite',
    nom: 'Justificatif de scolarité (certificat de scolarité)',
    categorie: CATEGORIES.SCOLARITE
  },
  ATTESTATION_SERVICES_SOCIAUX: {
    id: 'attestation_services_sociaux',
    nom: 'Attestation des services sociaux',
    categorie: CATEGORIES.SITUATION
  },
  JUSTIFICATIF_BOURSE: {
    id: 'justificatif_bourse',
    nom: 'Notification de bourse',
    categorie: CATEGORIES.BOURSE_ASE
  },
  JUSTIFICATIF_ASE: {
    id: 'justificatif_ase',
    nom: 'Justificatif de rattachement à l\'ASE',
    categorie: CATEGORIES.BOURSE_ASE
  },
  RIB: {
    id: 'rib',
    nom: 'RIB du payeur',
    categorie: CATEGORIES.IMAGINE_R
  },
  CONTRAT_IMAGINE_R: {
    id: 'contrat_imagine_r',
    nom: 'Contrat Pass Imagine R',
    categorie: CATEGORIES.IMAGINE_R
  }
}

/**
 * Justificatifs avec alternatives (pour les revenus)
 */
export const JUSTIFICATIFS_REVENUS_ALTERNATIVES = {
  id: 'revenus_alternatives',
  categorie: CATEGORIES.REVENUS,
  isAlternative: true,
  options: [
    {
      id: 'option_avis',
      label: 'Option 1',
      documents: ['Avis d\'imposition (contient les revenus et la composition familiale)']
    },
    {
      id: 'option_fiches',
      label: 'Option 2',
      documents: [
        'Justificatif de revenus (fiches de paie des 3 derniers mois)',
        'Justificatif de composition familiale (livret de famille ou extrait de naissance)'
      ]
    }
  ]
}

/**
 * Détermine les justificatifs nécessaires pour un enfant
 * @param {Object} enfant - Données de l'enfant
 * @param {Object} foyer - Données du foyer
 * @param {Object} aides - Résultat du calcul des aides
 * @returns {Array} Liste des justificatifs requis
 */
export const determinerJustificatifs = (enfant, foyer, aides) => {
  const justificatifs = []
  const justificatifsSet = new Set()

  // Si aucune aide n'est accordée, pas de justificatifs
  if (!aides.auMoinsUneAide) {
    return []
  }

  // 7.1 Justificatifs communs - Photo de l'enfant
  justificatifsSet.add(JUSTIFICATIFS.PHOTO_ENFANT)

  // 7.2 Justificatif de scolarité si établissement hors liste
  if (enfant.etablissement === 'autre' || !isCollegeDansListe(enfant.etablissement)) {
    justificatifsSet.add(JUSTIFICATIFS.JUSTIFICATIF_SCOLARITE)
  }

  // 7.3 Aides soumises aux revenus (QFM)
  // Si pas de situation particulière et aides liées aux revenus
  const aidesRevenus = [
    aides.reductionRestauration,
    aides.donOrdinateur
  ].some(a => a.eligible)

  let needsRevenusJustificatifs = false
  if (foyer.situationParticuliere === 'aucune' && aidesRevenus) {
    needsRevenusJustificatifs = true
  }

  // 7.4 Situation particulière
  if (foyer.situationParticuliere !== 'aucune') {
    justificatifsSet.add(JUSTIFICATIFS.ATTESTATION_SERVICES_SOCIAUX)
  }

  // 7.5 Bourse / ASE
  if (enfant.estBoursier && (
    aides.bonusBourseASE.eligible ||
    aides.remboursementImagineR.eligible ||
    aides.donOrdinateur.eligible
  )) {
    justificatifsSet.add(JUSTIFICATIFS.JUSTIFICATIF_BOURSE)
  }

  if (enfant.estASE) {
    justificatifsSet.add(JUSTIFICATIFS.JUSTIFICATIF_ASE)
  }

  // 7.6 Pass Imagine R
  if (aides.remboursementImagineR.eligible) {
    justificatifsSet.add(JUSTIFICATIFS.RIB)
    justificatifsSet.add(JUSTIFICATIFS.CONTRAT_IMAGINE_R)
    justificatifsSet.add(JUSTIFICATIFS.JUSTIFICATIF_BOURSE)
  }

  // Convertir en tableau et trier par catégorie
  const ordreCategories = Object.values(CATEGORIES)
  const sortedJustificatifs = Array.from(justificatifsSet).sort((a, b) => {
    return ordreCategories.indexOf(a.categorie) - ordreCategories.indexOf(b.categorie)
  })

  // Ajouter les justificatifs standards
  justificatifs.push(...sortedJustificatifs)

  // Ajouter les justificatifs de revenus avec alternatives si nécessaire
  if (needsRevenusJustificatifs) {
    justificatifs.push(JUSTIFICATIFS_REVENUS_ALTERNATIVES)
  }

  return justificatifs
}

/**
 * Regroupe les justificatifs par catégorie
 * @param {Array} justificatifs - Liste des justificatifs
 * @returns {Object} Justificatifs groupés par catégorie
 */
export const grouperParCategorie = (justificatifs) => {
  return justificatifs.reduce((acc, j) => {
    if (!acc[j.categorie]) {
      acc[j.categorie] = []
    }
    acc[j.categorie].push(j)
    return acc
  }, {})
}
