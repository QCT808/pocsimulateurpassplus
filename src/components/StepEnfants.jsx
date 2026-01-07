import posthog from 'posthog-js'
import { NumberInput } from './ui/NumberInput'
import { Button } from './ui/Button'

export const StepEnfants = ({
  nombreEnfants,
  setNombreEnfants,
  onNext,
  onPrev
}) => {
  const isValid = nombreEnfants >= 1

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      posthog.capture('etape_nombre_enfants_completee', {
        nombreEnfants
      })
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Nombre d'enfants
        </h2>

        <div className="max-w-xs">
          <NumberInput
            label="Combien d'enfants souhaitez-vous simuler ?"
            value={nombreEnfants}
            onChange={setNombreEnfants}
            min={1}
            max={10}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Vous pourrez renseigner les informations de chaque enfant à l'étape suivante.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit" disabled={!isValid}>
          Continuer
        </Button>
      </div>
    </form>
  )
}
