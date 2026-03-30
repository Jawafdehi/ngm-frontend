// ============================================================================
// PROTOTYPE DATA - Person Search Feature
// ============================================================================
// This file contains hardcoded person data extracted from case 080-CR-0158
// using Likhit (Jawafdehi MCP) for accurate Nepali text extraction.
//
// TODO: Replace with backend metadata when available
// Expected backend structure:
//   manuscript.metadata.persons = [
//     { name: "सुनिल पौडेल", name_english: "Sunil Poudel", role: "...", ... }
//   ]
//
// Migration path:
//   1. Backend adds "persons" array to manuscript metadata
//   2. Update IndexViewer.tsx to extract persons from metadata
//   3. Remove this file
// ============================================================================

export interface Person {
  id: string;
  name: string;
  nameEnglish?: string;
  role: string;
  cases: CaseInfo[];
}

export interface CaseInfo {
  caseId: string;
  caseNumber: string;
  title: string;
  amount: string;
  charges: string[];
  status: string;
  date: string;
  sources: string[];
}

// Sample data extracted from the case files using Likhit
export const personsData: Person[] = [
  {
    id: 'person-1',
    name: 'सुनिल पौडेल',
    nameEnglish: 'Sunil Poudel',
    role: 'पूर्व कार्यकारी निर्देशक, राष्ट्रिय सूचना प्रविधि केन्द्र तथा प्रबन्ध निर्देशक, नेपाल टेलिकम',
    cases: [
      {
        caseId: '080-CR-0158',
        caseNumber: '080-CR-0158',
        title: 'सुनिल पौडेलको २३ करोडको गैरकानुनी सम्पत्ति आर्जन',
        amount: 'रु. २३,७५,४६,३२४.५७',
        charges: [
          'गैरकानूनी सम्पत्ति आर्जन (भ्रष्टाचार निवारण ऐन, २०५९ को दफा २०)',
          'झुट्टा सम्पत्ति विवरण पेश (भ्रष्टाचार निवारण ऐन, २०५९ को दफा १६)',
          'विदेशी बैङ्कमा गैरकानूनी खाता र रकम जम्मा',
          'कमिशन लिने (स्वदेशी र विदेशी कम्पनीहरुसँग)',
          'टेण्डरमा मिलेमतो र योजनाबद्ध भ्रष्टाचार',
          'पदको दुरुपयोग (भ्रष्टाचार निवारण ऐन, २०५९ को दफा २४)'
        ],
        status: 'विशेष अदालत, काठमाडौंमा आरोपपत्र दायर (२०८१/०१/०९)',
        date: '२०८१/०१/०९',
        sources: [
          'CIAA Press Release (Likhit)',
          'BTV Business News',
          'Cabinet Decision',
          'Prasashan News'
        ]
      }
    ]
  },
  {
    id: 'person-2',
    name: 'अनिल पौडेल',
    nameEnglish: 'Anil Poudel',
    role: 'सहोदर दाजु (मध्यम व्यक्ति)',
    cases: [
      {
        caseId: '080-CR-0158',
        caseNumber: '080-CR-0158',
        title: 'सुनिल पौडेलको २३ करोडको गैरकानुनी सम्पत्ति आर्जन',
        amount: '-',
        charges: [
          'गैरकानूनी सम्पत्तिको लगानी/घरजग्गा खरिदमा सहयोग',
          'स्रोत नखुलेको सम्पत्तिबाट घरजग्गा खरिद'
        ],
        status: 'सम्पत्ति जफत प्रयोजनार्थ प्रतिवादी कायम (२०८१/०१/०९)',
        date: '२०८१/०१/०९',
        sources: [
          'CIAA Press Release (Likhit)',
          'BTV Business News'
        ]
      }
    ]
  },
  {
    id: 'person-3',
    name: 'दिपक पौडेल',
    nameEnglish: 'Dipak Poudel',
    role: 'सम्बन्धित व्यक्ति',
    cases: [
      {
        caseId: '080-CR-0158',
        caseNumber: '080-CR-0158',
        title: 'सुनिल पौडेलको २३ करोडको गैरकानुनी सम्पत्ति आर्जन',
        amount: '-',
        charges: [
          'सम्बन्धित व्यक्ति'
        ],
        status: 'अनुसन्धानमा',
        date: '२०८१/०१/०९',
        sources: [
          'Case Snapshot'
        ]
      }
    ]
  }
];

// Create a searchable index mapping person names to case IDs
export const personToCaseMap: Map<string, string[]> = new Map([
  ['सुनिल पौडेल', ['080-CR-0158']],
  ['sunil poudel', ['080-CR-0158']],
  ['अनिल पौडेल', ['080-CR-0158']],
  ['anil poudel', ['080-CR-0158']],
  ['दिपक पौडेल', ['080-CR-0158']],
  ['dipak poudel', ['080-CR-0158']],
]);

// Search function
export function searchPersons(query: string): Person[] {
  if (!query.trim()) {
    return personsData;
  }

  const lowerQuery = query.toLowerCase();
  
  return personsData.filter(person => 
    person.name.toLowerCase().includes(lowerQuery) ||
    person.nameEnglish?.toLowerCase().includes(lowerQuery) ||
    person.role.toLowerCase().includes(lowerQuery)
  );
}

// Check if a text contains any person names
export function containsPersonName(text: string, nameQuery: string): boolean {
  if (!nameQuery.trim()) return true;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = nameQuery.toLowerCase();
  
  // Check against all known persons
  for (const person of personsData) {
    const nepaliName = person.name.toLowerCase();
    const englishName = person.nameEnglish?.toLowerCase() || '';
    
    // Split names into parts for partial matching
    const nepaliParts = nepaliName.split(' ');
    const englishParts = englishName.split(' ');
    const queryParts = lowerQuery.split(' ');
    
    // Check if query matches any significant part of the person's name
    let queryMatchesPerson = false;
    
    // Check Nepali name
    if (nepaliName.includes(lowerQuery) || lowerQuery.includes(nepaliName)) {
      queryMatchesPerson = true;
    }
    
    // Check English name
    if (englishName && (englishName.includes(lowerQuery) || lowerQuery.includes(englishName))) {
      queryMatchesPerson = true;
    }
    
    // Check if query contains significant parts of the name (e.g., "sunil" or "poudel")
    for (const queryPart of queryParts) {
      if (queryPart.length >= 3) { // Only check meaningful parts (3+ chars)
        if (nepaliParts.some(part => part.includes(queryPart) || queryPart.includes(part))) {
          queryMatchesPerson = true;
        }
        if (englishParts.some(part => part.includes(queryPart) || queryPart.includes(part))) {
          queryMatchesPerson = true;
        }
      }
    }
    
    if (queryMatchesPerson) {
      // If searching for this person, check if this person's name appears in the text (in either form)
      const textContainsNepali = lowerText.includes(nepaliName);
      const textContainsEnglish = englishName && lowerText.includes(englishName);
      
      // Also check if text contains significant parts of the name
      let textContainsParts = false;
      for (const part of [...nepaliParts, ...englishParts]) {
        if (part.length >= 3 && lowerText.includes(part)) {
          textContainsParts = true;
          break;
        }
      }
      
      if (textContainsNepali || textContainsEnglish || textContainsParts) {
        return true;
      }
    }
  }
  
  // No person match found
  return false;
}
