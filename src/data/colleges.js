// Liste simulée de 5 collèges du département 92 (Hauts-de-Seine)
// Pour le POC, cette liste est statique

export const COLLEGES_92 = [
  {
    id: 'college-1',
    nom: 'Collège Jean Moulin',
    ville: 'Boulogne-Billancourt',
    departement: '92'
  },
  {
    id: 'college-2',
    nom: 'Collège Paul Éluard',
    ville: 'Nanterre',
    departement: '92'
  },
  {
    id: 'college-3',
    nom: 'Collège Victor Hugo',
    ville: 'Issy-les-Moulineaux',
    departement: '92'
  },
  {
    id: 'college-4',
    nom: 'Collège Albert Camus',
    ville: 'Neuilly-sur-Seine',
    departement: '92'
  },
  {
    id: 'college-5',
    nom: 'Collège Léonard de Vinci',
    ville: 'Levallois-Perret',
    departement: '92'
  }
]

export const isCollegeDansListe = (collegeId) => {
  return COLLEGES_92.some(c => c.id === collegeId)
}

export const getCollegeById = (collegeId) => {
  return COLLEGES_92.find(c => c.id === collegeId)
}
