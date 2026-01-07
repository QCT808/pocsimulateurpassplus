import { Button } from './ui/Button'
import { grouperParCategorie } from '../utils/justificatifs'

const AideCard = ({ titre, eligible, montant, criteres, raison }) => {
  return (
    <div
      className={`
        p-4 rounded-lg border-2
        ${eligible
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{titre}</h4>
          {eligible ? (
            <>
              {montant && (
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {montant} €
                </p>
              )}
              {!montant && (
                <p className="text-green-600 font-medium mt-1">Éligible</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-1">{raison}</p>
          )}
        </div>
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${eligible ? 'bg-green-500' : 'bg-gray-300'}
          `}
        >
          {eligible ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      {eligible && criteres && criteres.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-600 mb-1">Critères d'éligibilité :</p>
          <ul className="text-sm text-green-700 space-y-1">
            {criteres.map((c, i) => (
              <li key={i} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const EnfantResultat = ({ resultat }) => {
  const { enfant, aides, justificatifs } = resultat
  const justificatifsGroupes = grouperParCategorie(justificatifs)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Enfant {enfant.numero}
        </h3>
        {aides.auMoinsUneAide ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Éligible - {aides.montantTotal > 0 ? `${aides.montantTotal} €` : 'Aides disponibles'}
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Non éligible
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AideCard
          titre="Aide financière Pass+"
          eligible={aides.aideFinanciere.eligible}
          montant={aides.aideFinanciere.montant}
          criteres={aides.aideFinanciere.criteres}
          raison={aides.aideFinanciere.raison}
        />
        <AideCard
          titre="Bonus bourse / ASE"
          eligible={aides.bonusBourseASE.eligible}
          montant={aides.bonusBourseASE.montant}
          criteres={aides.bonusBourseASE.criteres}
          raison={aides.bonusBourseASE.raison}
        />
        <AideCard
          titre="Réduction restauration scolaire"
          eligible={aides.reductionRestauration.eligible}
          criteres={aides.reductionRestauration.criteres}
          raison={aides.reductionRestauration.raison}
        />
        <AideCard
          titre="Remboursement Pass Imagine R"
          eligible={aides.remboursementImagineR.eligible}
          criteres={aides.remboursementImagineR.criteres}
          raison={aides.remboursementImagineR.raison}
        />
        <AideCard
          titre="Don d'ordinateur"
          eligible={aides.donOrdinateur.eligible}
          criteres={aides.donOrdinateur.criteres}
          raison={aides.donOrdinateur.raison}
        />
      </div>

      {/* Justificatifs */}
      {justificatifs.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-4">
            Pièces justificatives à fournir
          </h4>
          <div className="space-y-4">
            {Object.entries(justificatifsGroupes).map(([categorie, docs]) => (
              <div key={categorie}>
                <p className="text-sm font-medium text-gray-600 mb-2">{categorie}</p>
                {docs.map((doc) => (
                  doc.isAlternative ? (
                    // Affichage des alternatives (revenus)
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-gray-600 italic">
                        Fournissez l'un des ensembles de documents suivants :
                      </p>
                      {doc.options.map((option, optIndex) => (
                        <div key={option.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-pass-plus-600 mb-2">
                            {option.label}
                          </p>
                          <ul className="space-y-1">
                            {option.documents.map((docName, docIndex) => (
                              <li
                                key={docIndex}
                                className="flex items-start text-sm text-gray-700"
                              >
                                <svg className="w-4 h-4 text-pass-plus-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                {docName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Affichage standard
                    <ul key={doc.id} className="space-y-1">
                      <li className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-pass-plus-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        {doc.nom}
                      </li>
                    </ul>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const StepResultats = ({ resultats, onReset, onPrev }) => {
  const { enfants, nombreEligibles, montantTotal, qfm } = resultats

  return (
    <div className="space-y-6">
      {/* Synthèse globale */}
      <div className="bg-gradient-to-r from-pass-plus-600 to-pass-plus-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Résultats de la simulation</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-white/80">Enfants simulés</p>
            <p className="text-3xl font-bold">{enfants.length}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-white/80">Enfants éligibles</p>
            <p className="text-3xl font-bold">{nombreEligibles}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-white/80">Montant total estimé</p>
            <p className="text-3xl font-bold">{montantTotal} €</p>
          </div>
          {qfm > 0 && (
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm text-white/80">QFM calculé</p>
              <p className="text-3xl font-bold">{qfm} €</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Information :</strong> Cette simulation est donnée à titre indicatif.
          L'éligibilité définitive sera vérifiée lors de la création de votre compte Pass+
          et du dépôt de votre dossier avec les pièces justificatives.
        </p>
      </div>

      {/* Résultats par enfant */}
      <div className="space-y-6">
        {enfants.map((resultat, index) => (
          <EnfantResultat key={index} resultat={resultat} />
        ))}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Et maintenant ?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={() => window.open('https://passplus.hauts-de-seine.fr', '_blank')}
            className="flex-1"
          >
            Créer un compte Pass+
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            className="flex-1"
          >
            Nouvelle simulation
          </Button>
        </div>
        <button
          onClick={onPrev}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Modifier mes réponses
        </button>
      </div>
    </div>
  )
}
