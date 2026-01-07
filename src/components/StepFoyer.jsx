import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { Select } from './ui/Select'
import { RadioGroup } from './ui/RadioGroup'
import { NumberInput } from './ui/NumberInput'
import { Button } from './ui/Button'
import { DEPARTEMENTS } from '../data/departements'

const situationsFamiliales = [
  { value: 'parent_seul', label: 'Parent seul' },
  { value: 'parents_ensemble', label: 'Parents ensemble' },
  { value: 'garde_alternee', label: 'Garde alternée' }
]

const situationsParticulieres = [
  { value: 'demandeur_asile', label: 'Demandeur d\'asile' },
  {
    value: 'difficulte_sociale',
    label: 'Situation de difficulté sociale',
    description: 'Accompagné par les services sociaux'
  },
  { value: 'aucune', label: 'Aucune situation particulière' }
]

export const StepFoyer = ({ foyer, setFoyer, onNext }) => {
  const hasTrackedStart = useRef(false)

  // Track simulation démarrée (une seule fois)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog.capture('simulation_demarree')
      hasTrackedStart.current = true
    }
  }, [])

  const departementOptions = DEPARTEMENTS.map(d => ({
    value: d.code,
    label: `${d.code} - ${d.nom}`
  }))

  const isRevenusRequired = foyer.situationParticuliere === 'aucune'
  const isValid =
    foyer.departement &&
    foyer.situationFamiliale &&
    foyer.situationParticuliere &&
    (!isRevenusRequired || (
      foyer.revenus !== null && foyer.revenus > 0 &&
      foyer.nombreParts !== null && foyer.nombreParts > 0
    ))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      // Track étape foyer complétée
      posthog.capture('etape_foyer_completee', {
        departement: foyer.departement,
        situationFamiliale: foyer.situationFamiliale,
        situationParticuliere: foyer.situationParticuliere,
        revenus: foyer.revenus || null,
        nombreParts: foyer.nombreParts || null
      })
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Informations sur le foyer
        </h2>

        <div className="space-y-6">
          <Select
            label="Département de résidence"
            value={foyer.departement}
            onChange={(val) => setFoyer({ departement: val })}
            options={departementOptions}
            placeholder="Sélectionnez votre département"
            required
          />

          <RadioGroup
            label="Situation familiale"
            name="situationFamiliale"
            value={foyer.situationFamiliale}
            onChange={(val) => setFoyer({ situationFamiliale: val })}
            options={situationsFamiliales}
            required
          />

          <RadioGroup
            label="Êtes-vous dans une situation particulière ?"
            name="situationParticuliere"
            value={foyer.situationParticuliere}
            onChange={(val) => setFoyer({ situationParticuliere: val })}
            options={situationsParticulieres}
            required
          />

          {isRevenusRequired && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
              <NumberInput
                label={
                  foyer.situationFamiliale === 'parent_seul'
                    ? 'Revenus annuels du responsable légal'
                    : 'Revenus annuels cumulés du foyer'
                }
                value={foyer.revenus}
                onChange={(val) => setFoyer({ revenus: val })}
                min={0}
                placeholder="Ex: 30000"
                suffix="€"
                required
              />
              <NumberInput
                label="Nombre de parts fiscales"
                value={foyer.nombreParts}
                onChange={(val) => setFoyer({ nombreParts: val })}
                min={1}
                max={20}
                step={0.5}
                placeholder="Ex: 2.5"
                required
              />
              <p className="text-sm text-blue-600">
                Ces informations figurent sur votre avis d'imposition et servent au calcul du Quotient Familial Mensuel (QFM).
                Le nombre de parts peut être différent du nombre d'enfants à simuler.
              </p>
            </div>
          )}

          {!isRevenusRequired && foyer.situationParticuliere && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700">
                En raison de votre situation particulière, les revenus ne sont pas demandés.
                Le QFM est considéré comme compatible avec les aides soumises aux revenus.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid}>
          Continuer
        </Button>
      </div>
    </form>
  )
}
