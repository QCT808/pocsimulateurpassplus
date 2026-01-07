import { ETAPES } from '../hooks/useSimulateur'

const etapesLabels = [
  { etape: ETAPES.FOYER, label: 'Foyer' },
  { etape: ETAPES.NOMBRE_ENFANTS, label: 'Enfants' },
  { etape: ETAPES.ENFANTS, label: 'Informations' },
  { etape: ETAPES.RESULTATS, label: 'Résultats' }
]

export const Stepper = ({ etapeActuelle, enfantEnCours, nombreEnfants }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {etapesLabels.map((e, index) => {
          const isActive = etapeActuelle === e.etape
          const isCompleted = etapeActuelle > e.etape
          const isLast = index === etapesLabels.length - 1

          return (
            <div key={e.etape} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${isCompleted
                      ? 'bg-pass-plus-600 text-white'
                      : isActive
                        ? 'bg-pass-plus-600 text-white ring-4 ring-pass-plus-200'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium whitespace-nowrap
                    ${isActive || isCompleted ? 'text-pass-plus-600' : 'text-gray-500'}
                  `}
                >
                  {e.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    w-12 sm:w-16 md:w-24 h-1 mx-2 sm:mx-3 rounded
                    ${isCompleted ? 'bg-pass-plus-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Indicateur enfant en cours */}
      {etapeActuelle === ETAPES.ENFANTS && nombreEnfants > 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Enfant {enfantEnCours + 1} sur {nombreEnfants}
        </div>
      )}
    </div>
  )
}
