import { useReducer, useCallback } from 'react'
import { calculerQFM } from '../utils/qfm'
import { calculerToutesAides } from '../utils/eligibilite'
import { determinerJustificatifs } from '../utils/justificatifs'

// Étapes du simulateur
export const ETAPES = {
  FOYER: 1,
  NOMBRE_ENFANTS: 2,
  ENFANTS: 3,
  RESULTATS: 4
}

// État initial
const initialState = {
  etape: ETAPES.FOYER,
  foyer: {
    departement: null,
    situationFamiliale: null,
    situationParticuliere: null,
    revenus: null,
    nombreParts: null
  },
  nombreEnfants: 1,
  enfants: [],
  enfantEnCours: 0,
  resultats: null
}

// Actions
const ACTIONS = {
  SET_FOYER: 'SET_FOYER',
  SET_NOMBRE_ENFANTS: 'SET_NOMBRE_ENFANTS',
  SET_ENFANT: 'SET_ENFANT',
  NEXT_ENFANT: 'NEXT_ENFANT',
  PREV_ENFANT: 'PREV_ENFANT',
  SET_ETAPE: 'SET_ETAPE',
  CALCULER_RESULTATS: 'CALCULER_RESULTATS',
  RESET: 'RESET'
}

// Création d'un enfant vide
const creerEnfantVide = (index) => ({
  id: index,
  resideChezResponsable: true,
  departementResidence: null,
  niveauScolaire: null,
  etablissement: null,
  departementScolarisation: null,
  cantineDansListe: null,
  collegeCantine: null,
  estBoursier: false,
  echelonBourse: null,
  estASE: false,
  souhaiteImagineR: false
})

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FOYER:
      return {
        ...state,
        foyer: { ...state.foyer, ...action.payload }
      }

    case ACTIONS.SET_NOMBRE_ENFANTS: {
      const nombreEnfants = action.payload
      const enfants = Array.from({ length: nombreEnfants }, (_, i) =>
        state.enfants[i] || creerEnfantVide(i)
      )
      return {
        ...state,
        nombreEnfants,
        enfants
      }
    }

    case ACTIONS.SET_ENFANT: {
      const { index, data } = action.payload
      const enfants = [...state.enfants]
      enfants[index] = { ...enfants[index], ...data }
      return {
        ...state,
        enfants
      }
    }

    case ACTIONS.NEXT_ENFANT:
      return {
        ...state,
        enfantEnCours: Math.min(state.enfantEnCours + 1, state.nombreEnfants - 1)
      }

    case ACTIONS.PREV_ENFANT:
      return {
        ...state,
        enfantEnCours: Math.max(state.enfantEnCours - 1, 0)
      }

    case ACTIONS.SET_ETAPE:
      return {
        ...state,
        etape: action.payload,
        enfantEnCours: action.payload === ETAPES.ENFANTS ? 0 : state.enfantEnCours
      }

    case ACTIONS.CALCULER_RESULTATS: {
      const { foyer, enfants } = state

      // Calcul du QFM
      let qfm = 0
      if (foyer.situationParticuliere === 'aucune' && foyer.revenus && foyer.nombreParts) {
        qfm = calculerQFM(foyer.revenus, foyer.nombreParts)
      }

      // Calcul des aides pour chaque enfant
      const resultatsEnfants = enfants.map((enfant, index) => {
        const aides = calculerToutesAides(enfant, foyer, qfm)
        const justificatifs = determinerJustificatifs(enfant, foyer, aides)

        return {
          enfant: { ...enfant, numero: index + 1 },
          aides,
          justificatifs
        }
      })

      // Synthèse globale
      const nombreEligibles = resultatsEnfants.filter(r => r.aides.auMoinsUneAide).length
      const totalAideFinanciere = resultatsEnfants.reduce((sum, r) => sum + r.aides.montantAideFinanciere, 0)
      const totalImagineR = resultatsEnfants.reduce((sum, r) => sum + r.aides.montantImagineR, 0)
      const montantTotal = totalAideFinanciere + totalImagineR

      return {
        ...state,
        resultats: {
          qfm,
          enfants: resultatsEnfants,
          nombreEligibles,
          totalAideFinanciere,
          totalImagineR,
          montantTotal
        }
      }
    }

    case ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}

/**
 * Hook principal de gestion du simulateur
 */
export const useSimulateur = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Actions
  const setFoyer = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_FOYER, payload: data })
  }, [])

  const setNombreEnfants = useCallback((nombre) => {
    dispatch({ type: ACTIONS.SET_NOMBRE_ENFANTS, payload: nombre })
  }, [])

  const setEnfant = useCallback((index, data) => {
    dispatch({ type: ACTIONS.SET_ENFANT, payload: { index, data } })
  }, [])

  const nextEnfant = useCallback(() => {
    dispatch({ type: ACTIONS.NEXT_ENFANT })
  }, [])

  const prevEnfant = useCallback(() => {
    dispatch({ type: ACTIONS.PREV_ENFANT })
  }, [])

  const setEtape = useCallback((etape) => {
    dispatch({ type: ACTIONS.SET_ETAPE, payload: etape })
  }, [])

  const allerEtapeSuivante = useCallback(() => {
    const { etape, enfantEnCours, nombreEnfants } = state

    if (etape === ETAPES.FOYER) {
      setEtape(ETAPES.NOMBRE_ENFANTS)
    } else if (etape === ETAPES.NOMBRE_ENFANTS) {
      // S'assurer que les enfants sont bien initialisés avant de passer à l'étape suivante
      setNombreEnfants(nombreEnfants)
      setEtape(ETAPES.ENFANTS)
    } else if (etape === ETAPES.ENFANTS) {
      if (enfantEnCours < nombreEnfants - 1) {
        nextEnfant()
      } else {
        dispatch({ type: ACTIONS.CALCULER_RESULTATS })
        setEtape(ETAPES.RESULTATS)
      }
    }
  }, [state, setEtape, setNombreEnfants, nextEnfant])

  const allerEtapePrecedente = useCallback(() => {
    const { etape, enfantEnCours } = state

    if (etape === ETAPES.RESULTATS) {
      setEtape(ETAPES.ENFANTS)
    } else if (etape === ETAPES.ENFANTS) {
      if (enfantEnCours > 0) {
        prevEnfant()
      } else {
        setEtape(ETAPES.NOMBRE_ENFANTS)
      }
    } else if (etape === ETAPES.NOMBRE_ENFANTS) {
      setEtape(ETAPES.FOYER)
    }
  }, [state, setEtape, prevEnfant])

  const reset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET })
  }, [])

  // Données dérivées
  const enfantActuel = state.enfants[state.enfantEnCours] || null
  const progression = (() => {
    const { etape, enfantEnCours, nombreEnfants } = state
    if (etape === ETAPES.FOYER) return 1
    if (etape === ETAPES.NOMBRE_ENFANTS) return 2
    if (etape === ETAPES.ENFANTS) return 3 + (enfantEnCours / nombreEnfants) * 0.9
    return 4
  })()

  return {
    // État
    ...state,
    enfantActuel,
    progression,

    // Actions
    setFoyer,
    setNombreEnfants,
    setEnfant,
    allerEtapeSuivante,
    allerEtapePrecedente,
    reset
  }
}
