import posthog from 'posthog-js'
import { RadioGroup } from './ui/RadioGroup'
import { Select } from './ui/Select'
import { Checkbox } from './ui/Checkbox'
import { Button } from './ui/Button'
import { COLLEGES_92, isCollegeDansListe } from '../data/colleges'
import { DEPARTEMENTS, isDepartement92 } from '../data/departements'

const niveauxScolaires = [
  { value: 'college', label: 'Collège' },
  { value: 'lycee', label: 'Lycée' },
  { value: 'autre', label: 'Autre' }
]

const echelonsBourse = [
  { value: '1', label: 'Échelon 1' },
  { value: '2', label: 'Échelon 2' },
  { value: '3', label: 'Échelon 3' }
]

const ouiNonOptions = [
  { value: true, label: 'Oui' },
  { value: false, label: 'Non' }
]

export const StepEnfantForm = ({
  enfant,
  numero,
  nombreEnfants,
  setEnfant,
  onNext,
  onPrev
}) => {
  // Protection contre enfant null
  if (!enfant) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p>Chargement...</p>
      </div>
    )
  }

  const departementOptions = DEPARTEMENTS.map(d => ({
    value: d.code,
    label: `${d.code} - ${d.nom}`
  }))

  const collegeOptions = [
    ...COLLEGES_92.map(c => ({
      value: c.id,
      label: `${c.nom} - ${c.ville}`
    })),
    { value: 'autre', label: 'Autre établissement' }
  ]

  // Options pour la cantine (sans "autre établissement" qui signifie pas de réduction)
  const collegeCantineOptions = [
    ...COLLEGES_92.map(c => ({
      value: c.id,
      label: `${c.nom} - ${c.ville}`
    })),
    { value: 'autre', label: 'Autre établissement (pas de réduction tarifaire)' }
  ]

  const estDansCollegeListe = enfant.etablissement && isCollegeDansListe(enfant.etablissement)
  const estEtablissementAutre = enfant.etablissement === 'autre'
  const estScolarise92 = estEtablissementAutre && isDepartement92(enfant.departementScolarisation)

  // Validation
  const isValid = (() => {
    if (!enfant.niveauScolaire) return false
    if (enfant.niveauScolaire !== 'college') return true // On peut continuer même si non collégien

    if (!enfant.etablissement) return false
    if (estEtablissementAutre && !enfant.departementScolarisation) return false
    if (!enfant.resideChezResponsable && !enfant.departementResidence) return false

    // Si scolarisé dans le 92 hors liste et dit manger à la cantine, doit sélectionner où
    if (estScolarise92 && enfant.cantineDansListe === true && !enfant.collegeCantine) {
      return false
    }

    return true
  })()

  const handleChange = (field, value) => {
    const updates = { [field]: value }

    // Reset collegeCantine si cantineDansListe change
    if (field === 'cantineDansListe' && value === false) {
      updates.collegeCantine = null
    }

    // Reset cantine si établissement change
    if (field === 'etablissement') {
      updates.cantineDansListe = null
      updates.collegeCantine = null
    }

    // Reset departementScolarisation si établissement n'est plus "autre"
    if (field === 'etablissement' && value !== 'autre') {
      updates.departementScolarisation = null
    }

    setEnfant(updates)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      // Track étape enfant complétée
      posthog.capture('etape_enfant_completee', {
        numeroEnfant: numero,
        nombreEnfantsTotal: nombreEnfants,
        niveauScolaire: enfant.niveauScolaire,
        resideChezResponsable: enfant.resideChezResponsable,
        departementResidence: enfant.departementResidence || null,
        etablissement: enfant.etablissement || null,
        estDansCollegeListe,
        departementScolarisation: enfant.departementScolarisation || null,
        cantineDansListe: enfant.cantineDansListe,
        collegeCantine: enfant.collegeCantine || null,
        estBoursier: enfant.estBoursier,
        echelonBourse: enfant.echelonBourse || null,
        estASE: enfant.estASE,
        souhaiteImagineR: enfant.souhaiteImagineR
      })
      onNext()
    }
  }

  const isLastEnfant = numero === nombreEnfants

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {nombreEnfants > 1 ? `Enfant ${numero}` : 'Informations sur l\'enfant'}
        </h2>

        <div className="space-y-6">
          {/* Résidence */}
          <RadioGroup
            label="L'enfant réside-t-il à votre adresse ?"
            name="resideChezResponsable"
            value={enfant.resideChezResponsable}
            onChange={(val) => handleChange('resideChezResponsable', val)}
            options={ouiNonOptions}
          />

          {enfant.resideChezResponsable === false && (
            <Select
              label="Département de résidence de l'enfant"
              value={enfant.departementResidence}
              onChange={(val) => handleChange('departementResidence', val)}
              options={departementOptions}
              required
            />
          )}

          {/* Niveau scolaire */}
          <RadioGroup
            label="Niveau scolaire"
            name="niveauScolaire"
            value={enfant.niveauScolaire}
            onChange={(val) => handleChange('niveauScolaire', val)}
            options={niveauxScolaires}
            required
          />

          {enfant.niveauScolaire && enfant.niveauScolaire !== 'college' && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium">
                Les aides Pass+ sont réservées aux collégiens.
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Vous pouvez continuer pour voir le récapitulatif, mais cet enfant ne sera pas éligible aux aides.
              </p>
            </div>
          )}

          {/* Établissement scolaire (si collégien) */}
          {enfant.niveauScolaire === 'college' && (
            <>
              <Select
                label="Établissement scolaire"
                value={enfant.etablissement}
                onChange={(val) => handleChange('etablissement', val)}
                options={collegeOptions}
                placeholder="Sélectionnez un établissement"
                required
              />

              {estEtablissementAutre && (
                <Select
                  label="Département de scolarisation"
                  value={enfant.departementScolarisation}
                  onChange={(val) => handleChange('departementScolarisation', val)}
                  options={departementOptions}
                  required
                />
              )}

              {/* Cantine - uniquement si scolarisé dans le 92 mais hors liste */}
              {estScolarise92 && (
                <>
                  <RadioGroup
                    label="L'enfant mange-t-il à la cantine dans un des collèges du département ?"
                    name="cantineDansListe"
                    value={enfant.cantineDansListe}
                    onChange={(val) => handleChange('cantineDansListe', val)}
                    options={ouiNonOptions}
                  />

                  {enfant.cantineDansListe === true && (
                    <Select
                      label="Dans quel collège mange-t-il à la cantine ?"
                      value={enfant.collegeCantine}
                      onChange={(val) => handleChange('collegeCantine', val)}
                      options={collegeCantineOptions}
                      placeholder="Sélectionnez le collège"
                      required
                    />
                  )}

                  {enfant.collegeCantine === 'autre' && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700">
                        Si l'enfant mange dans un établissement qui n'est pas dans la liste,
                        il ne pourra pas bénéficier de la réduction tarifaire sur la restauration scolaire.
                      </p>
                    </div>
                  )}

                  {enfant.collegeCantine && isCollegeDansListe(enfant.collegeCantine) && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        L'enfant pourra potentiellement bénéficier de la réduction tarifaire
                        sur la restauration scolaire dans cet établissement.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Bourse */}
              <div className="border-t pt-6">
                <Checkbox
                  label="L'enfant est-il boursier ?"
                  checked={enfant.estBoursier}
                  onChange={(val) => handleChange('estBoursier', val)}
                />

                {enfant.estBoursier && (
                  <div className="mt-4 ml-8">
                    <Select
                      label="Échelon de bourse"
                      value={enfant.echelonBourse}
                      onChange={(val) => handleChange('echelonBourse', val)}
                      options={echelonsBourse}
                    />
                  </div>
                )}
              </div>

              {/* ASE */}
              <div className="border-t pt-6">
                <Checkbox
                  label="L'enfant est-il rattaché à l'ASE (Aide Sociale à l'Enfance) ?"
                  checked={enfant.estASE}
                  onChange={(val) => handleChange('estASE', val)}
                />
              </div>

              {/* Pass Imagine R */}
              <div className="border-t pt-6">
                <Checkbox
                  label="L'enfant utilise-t-il ou souhaite-t-il utiliser le Pass Imagine R ?"
                  checked={enfant.souhaiteImagineR}
                  onChange={(val) => handleChange('souhaiteImagineR', val)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit" disabled={!isValid}>
          {isLastEnfant ? 'Voir les résultats' : 'Enfant suivant'}
        </Button>
      </div>
    </form>
  )
}
