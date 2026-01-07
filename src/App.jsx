import { Analytics } from '@vercel/analytics/react'
import { useSimulateur, ETAPES } from './hooks/useSimulateur'
import { Stepper } from './components/Stepper'
import { StepFoyer } from './components/StepFoyer'
import { StepEnfants } from './components/StepEnfants'
import { StepEnfantForm } from './components/StepEnfantForm'
import { StepResultats } from './components/StepResultats'

function App() {
  const {
    etape,
    foyer,
    nombreEnfants,
    enfants,
    enfantEnCours,
    enfantActuel,
    resultats,
    setFoyer,
    setNombreEnfants,
    setEnfant,
    allerEtapeSuivante,
    allerEtapePrecedente,
    reset
  } = useSimulateur()

  const renderEtape = () => {
    switch (etape) {
      case ETAPES.FOYER:
        return (
          <StepFoyer
            foyer={foyer}
            setFoyer={setFoyer}
            onNext={allerEtapeSuivante}
          />
        )

      case ETAPES.NOMBRE_ENFANTS:
        return (
          <StepEnfants
            nombreEnfants={nombreEnfants}
            setNombreEnfants={setNombreEnfants}
            onNext={allerEtapeSuivante}
            onPrev={allerEtapePrecedente}
          />
        )

      case ETAPES.ENFANTS:
        return (
          <StepEnfantForm
            enfant={enfantActuel}
            numero={enfantEnCours + 1}
            nombreEnfants={nombreEnfants}
            setEnfant={(data) => setEnfant(enfantEnCours, data)}
            onNext={allerEtapeSuivante}
            onPrev={allerEtapePrecedente}
          />
        )

      case ETAPES.RESULTATS:
        return (
          <StepResultats
            resultats={resultats}
            onReset={reset}
            onPrev={allerEtapePrecedente}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pass-plus-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P+</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Simulateur Pass+
              </h1>
              <p className="text-sm text-gray-500">
                Hauts-de-Seine (92)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction (uniquement à la première étape) */}
        {etape === ETAPES.FOYER && (
          <div className="mb-8 p-6 bg-pass-plus-50 rounded-xl border border-pass-plus-100">
            <h2 className="text-lg font-semibold text-pass-plus-900 mb-2">
              Bienvenue sur le simulateur d'éligibilité Pass+
            </h2>
            <p className="text-pass-plus-700">
              Ce simulateur vous permet d'identifier les aides Pass+ auxquelles vos enfants
              peuvent être éligibles et de connaître les pièces justificatives à fournir.
            </p>
            <p className="text-sm text-pass-plus-600 mt-2">
              Aucune donnée n'est conservée. Ce simulateur est purement informatif.
            </p>
          </div>
        )}

        {/* Stepper */}
        <Stepper
          etapeActuelle={etape}
          enfantEnCours={enfantEnCours}
          nombreEnfants={nombreEnfants}
        />

        {/* Contenu de l'étape */}
        {renderEtape()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            Simulateur informatif - Les résultats ne constituent pas un engagement.
            <br />
            Département des Hauts-de-Seine
          </p>
        </div>
      </footer>

      <Analytics />
    </div>
  )
}

export default App
