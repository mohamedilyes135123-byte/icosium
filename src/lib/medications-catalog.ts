// ─── Medication Catalog — 18 Categories ─────────────────────────────────────
export interface MedCategory {
  id: string;
  code: string;
  name: string;
  icon: string;
  color: string;
  subcategories: MedSubcategory[];
}

export interface MedSubcategory {
  id: string;
  letter: string;
  name: string;
  drugs: string[];
}

export const MEDICATION_CATALOG: MedCategory[] = [
  {
    id: "cat-01", code: "01", name: "ANTI-INFECTIEUX", icon: "🦠", color: "#ef4444",
    subcategories: [
      { id: "01-a", letter: "A", name: "ANTIBACTÉRIENS", drugs: [
        "Amoxicilline 500mg", "Amoxicilline 1g", "Amoxicilline/Ac. Clavulanique 1g",
        "Ampicilline 500mg", "Céfixime 200mg", "Céfaclor 250mg",
        "Ceftriaxone 1g (inj)", "Céfotaxime 1g (inj)",
        "Imipénème 500mg (inj)", "Méropénème 1g (inj)",
        "Azithromycine 500mg", "Azithromycine 250mg", "Clarithromycine 500mg", "Érythromycine 500mg",
        "Ciprofloxacine 500mg", "Lévofloxacine 500mg", "Ofloxacine 200mg", "Moxifloxacine 400mg",
        "Gentamicine 80mg (inj)", "Amikacine 500mg (inj)",
        "Doxycycline 100mg", "Tétracycline 250mg",
        "Cotrimoxazole 480mg", "Sulfadiazine 500mg",
        "Métronidazole 500mg", "Métronidazole 250mg",
      ]},
      { id: "01-b", letter: "B", name: "ANTIVIRAUX", drugs: [
        "Acyclovir 200mg", "Acyclovir 400mg", "Valacyclovir 500mg",
        "Oseltamivir 75mg", "Ribavirine 200mg",
        "Interféron alpha", "Interféron bêta",
        "Ténofovir 300mg", "Lamivudine 150mg", "Zidovudine 300mg",
        "Lopinavir/Ritonavir 200/50mg",
      ]},
      { id: "01-c", letter: "C", name: "ANTIFONGIQUES", drugs: [
        "Fluconazole 150mg", "Fluconazole 50mg", "Itraconazole 100mg", "Kétoconazole 200mg",
        "Amphotéricine B (inj)", "Nystatine (susp. buvable)",
        "Caspofungine 50mg (inj)",
        "Terbinafine 250mg",
      ]},
      { id: "01-d", letter: "D", name: "ANTIPROTOZOAIRES / ANTHELMINTHIQUES", drugs: [
        "Métronidazole 500mg (antiprotozoaire)", "Quinine 300mg",
        "Chloroquine 100mg", "Artéméther/Luméfantrine",
        "Albendazole 400mg", "Mébendazole 100mg", "Ivermectine 3mg",
      ]},
    ]
  },
  {
    id: "cat-02", code: "02", name: "SYSTÈME CARDIOVASCULAIRE", icon: "❤️", color: "#dc2626",
    subcategories: [
      { id: "02-a", letter: "A", name: "ANTIHYPERTENSEURS", drugs: [
        "Furosémide 40mg", "Hydrochlorothiazide 25mg", "Indapamide 1.5mg", "Spironolactone 25mg",
        "Ramipril 5mg", "Ramipril 10mg", "Enalapril 10mg", "Enalapril 20mg", "Captopril 25mg",
        "Losartan 50mg", "Valsartan 80mg", "Valsartan 160mg", "Irbésartan 150mg", "Candésartan 8mg",
        "Amlodipine 5mg", "Amlodipine 10mg", "Nifédipine 20mg LP", "Diltiazem 60mg",
        "Bisoprolol 5mg", "Bisoprolol 10mg", "Atenolol 50mg", "Atenolol 100mg", "Propranolol 40mg", "Métoprolol 50mg",
        "Prazosine 1mg", "Doxazosine 4mg",
      ]},
      { id: "02-b", letter: "B", name: "ANTIANGINEUX", drugs: [
        "Trinitrine (spray sublingual)", "Isosorbide dinitrate 20mg", "Isosorbide mononitrate 40mg",
        "Bisoprolol 5mg", "Atenolol 50mg",
        "Amlodipine 5mg", "Diltiazem 60mg",
      ]},
      { id: "02-c", letter: "C", name: "ANTIARYTHMIQUES", drugs: [
        "Lidocaïne (inj)", "Propafénone 150mg",
        "Propranolol 40mg", "Bisoprolol 5mg",
        "Amiodarone 200mg", "Sotalol 80mg",
        "Vérapamil 80mg", "Diltiazem 60mg",
      ]},
      { id: "02-d", letter: "D", name: "HYPOLIPÉMIANTS", drugs: [
        "Atorvastatine 10mg", "Atorvastatine 20mg", "Atorvastatine 40mg",
        "Rosuvastatine 10mg", "Rosuvastatine 20mg",
        "Simvastatine 20mg", "Simvastatine 40mg",
        "Fénofibrate 160mg", "Gemfibrozil 600mg",
      ]},
      { id: "02-e", letter: "E", name: "ANTICOAGULANTS / ANTIAGRÉGANTS", drugs: [
        "Aspirine 100mg", "Clopidogrel 75mg", "Ticagrélor 90mg",
        "Warfarine 5mg", "Acénocoumarol 4mg",
        "Enoxaparine 40mg (inj)", "Héparine sodique (inj)",
        "Rivaroxaban 20mg", "Apixaban 5mg",
      ]},
    ]
  },
  {
    id: "cat-03", code: "03", name: "SYSTÈME NERVEUX CENTRAL", icon: "🧠", color: "#8b5cf6",
    subcategories: [
      { id: "03-a", letter: "A", name: "ANALGÉSIQUES", drugs: [
        "Paracétamol 500mg", "Paracétamol 1g", "Doliprane 500mg",
        "Ibuprofène 400mg", "Ibuprofène 600mg", "Diclofénac 50mg", "Kétoprofène 100mg",
        "Tramadol 50mg", "Codéine/Paracétamol", "Morphine 10mg",
      ]},
      { id: "03-b", letter: "B", name: "ANESTHÉSIQUES", drugs: [
        "Propofol (inj)", "Thiopental (inj)", "Kétamine (inj)",
        "Lidocaïne 2% (locale)", "Bupivacaïne 0.5% (locale)",
      ]},
      { id: "03-c", letter: "C", name: "SÉDATIFS / HYPNOTIQUES", drugs: [
        "Bromazépam 3mg", "Bromazépam 6mg", "Diazépam 5mg", "Diazépam 10mg",
        "Alprazolam 0.25mg", "Alprazolam 0.5mg",
        "Zolpidem 10mg", "Zopiclone 7.5mg",
        "Phénobarbital 100mg",
      ]},
      { id: "03-d", letter: "D", name: "ANTICONVULSIVANTS", drugs: [
        "Carbamazépine 200mg", "Phénytoïne 100mg", "Lamotrigine 100mg",
        "Acide Valproïque 500mg", "Gabapentine 300mg", "Prégabaline 75mg",
        "Clonazépam 2mg", "Vigabatrine 500mg",
      ]},
      { id: "03-e", letter: "E", name: "ANTIPARKINSONIENS", drugs: [
        "Lévodopa/Carbidopa 250/25mg", "Lévodopa/Bensérazide 200/50mg",
        "Pramipexole 0.25mg", "Ropinirole 2mg",
        "Sélégiline 5mg", "Rasagiline 1mg",
        "Trihexyphénidyle 2mg",
      ]},
      { id: "03-f", letter: "F", name: "PSYCHOTROPES", drugs: [
        "Halopéridol 5mg", "Chlorpromazine 100mg", "Rispéridone 2mg", "Olanzapine 10mg",
        "Fluoxétine 20mg", "Sertraline 50mg", "Paroxétine 20mg", "Escitalopram 10mg",
        "Amitriptyline 25mg", "Clomipramine 25mg",
        "Lithium 250mg", "Acide Valproïque 500mg (stabilisateur)",
        "Méthylphénidate 10mg",
      ]},
    ]
  },
  {
    id: "cat-04", code: "04", name: "SYSTÈME RESPIRATOIRE", icon: "🫁", color: "#06b6d4",
    subcategories: [
      { id: "04-a", letter: "A", name: "BRONCHODILATATEURS", drugs: [
        "Salbutamol 100mcg (spray)", "Salbutamol nébulisation", "Fénotérol (spray)",
        "Ipratropium bromide (spray)", "Tiotropium 18mcg (inhalateur)",
        "Théophylline 200mg LP",
      ]},
      { id: "04-b", letter: "B", name: "ANTI-ASTHMATIQUES", drugs: [
        "Béclométhasone 250mcg (spray)", "Budésonide 200mcg (spray)", "Fluticasone 125mcg (spray)",
        "Montélukast 10mg", "Montélukast 5mg (enfant)",
        "Cromoglycate sodique (spray)",
        "Salbutamol/Fluticasone (Seretide)",
      ]},
      { id: "04-c", letter: "C", name: "TOUX ET RHUME", drugs: [
        "Dextrométhorphane 15mg", "Codéine sirop",
        "Acétylcystéine 200mg", "Carbocistéine sirop", "Ambroxol 30mg",
        "Pseudoéphédrine 60mg", "Oxymétazoline (spray nasal)",
        "Cétirizine 10mg", "Loratadine 10mg", "Desloratadine 5mg", "Fexofénadine 180mg",
      ]},
    ]
  },
  {
    id: "cat-05", code: "05", name: "SYSTÈME GASTRO-INTESTINAL", icon: "🫄", color: "#f59e0b",
    subcategories: [
      { id: "05-a", letter: "A", name: "ANTIACIDES / ANTI-ULCÉREUX", drugs: [
        "Ranitidine 150mg", "Famotidine 40mg",
        "Oméprazole 20mg", "Pantoprazole 40mg", "Ésoméprazole 40mg", "Lansoprazole 30mg",
        "Sucralfate 1g", "Misoprostol 200mcg",
      ]},
      { id: "05-b", letter: "B", name: "ANTIÉMÉTIQUES", drugs: [
        "Ondansétron 4mg", "Granisétron 1mg",
        "Métoclopramide 10mg", "Dompéridone 10mg",
        "Dimenhydrinate 50mg", "Méclizine 25mg",
      ]},
      { id: "05-c", letter: "C", name: "LAXATIFS", drugs: [
        "Lactulose sirop", "Macrogol (sachets)", "Bisacodyl 5mg", "Séné (comprimés)",
      ]},
      { id: "05-d", letter: "D", name: "ANTIDIARRHÉIQUES", drugs: [
        "Lopéramide 2mg", "Racécadotril 100mg", "SRO (sels de réhydratation)",
      ]},
      { id: "05-e", letter: "E", name: "HÉPATOPROTECTEURS", drugs: [
        "Silymarine 140mg", "Acide Ursodésoxycholique 250mg",
      ]},
    ]
  },
  {
    id: "cat-06", code: "06", name: "SYSTÈME ENDOCRINIEN", icon: "🧬", color: "#ec4899",
    subcategories: [
      { id: "06-a", letter: "A", name: "ANTIDIABÉTIQUES", drugs: [
        "Insuline Rapide", "Insuline Lente", "Insuline Mix 30/70",
        "Metformine 500mg", "Metformine 850mg", "Metformine 1000mg",
        "Glibenclamide 5mg", "Gliclazide 30mg MR", "Gliclazide 80mg", "Glimépiride 2mg",
        "Sitagliptine 100mg", "Vildagliptine 50mg",
        "Dapagliflozine 10mg", "Empagliflozine 10mg",
      ]},
      { id: "06-b", letter: "B", name: "THYROÏDIENS / ANTITHYROÏDIENS", drugs: [
        "Lévothyroxine 50mcg", "Lévothyroxine 100mcg",
        "Carbimazole 5mg", "Propylthiouracile 50mg",
      ]},
      { id: "06-c", letter: "C", name: "CORTICOSTÉROÏDES", drugs: [
        "Prednisolone 5mg", "Prednisolone 20mg", "Prednisone 5mg",
        "Dexaméthasone 0.5mg", "Dexaméthasone 4mg (inj)",
        "Hydrocortisone 10mg", "Méthylprednisolone 16mg",
      ]},
      { id: "06-d", letter: "D", name: "HORMONES ET ANALOGUES", drugs: [
        "Œstradiol 2mg", "Progestérone 200mg",
        "Testostérone (inj)", "Desmopressine 0.1mg",
        "Octréotide (inj)",
      ]},
    ]
  },
  {
    id: "cat-07", code: "07", name: "SYSTÈME MUSCULO-SQUELETTIQUE", icon: "🦴", color: "#78716c",
    subcategories: [
      { id: "07-a", letter: "A", name: "AINS", drugs: [
        "Ibuprofène 400mg", "Diclofénac 50mg", "Diclofénac 75mg (inj)", "Naproxène 500mg", "Kétoprofène 100mg",
        "Célécoxib 200mg", "Étoricoxib 90mg",
      ]},
      { id: "07-b", letter: "B", name: "RELAXANTS MUSCULAIRES", drugs: [
        "Thiocolchicoside 4mg", "Thiocolchicoside 8mg", "Baclofène 10mg", "Tizanidine 4mg",
      ]},
      { id: "07-c", letter: "C", name: "ANTIARTHRITIQUES", drugs: [
        "Méthotrexate 2.5mg", "Hydroxychloroquine 200mg", "Sulfasalazine 500mg", "Colchicine 1mg",
      ]},
      { id: "07-d", letter: "D", name: "MÉDICAMENTS POUR LES OS", drugs: [
        "Alendronate 70mg", "Risédronate 35mg",
        "Calcium/Vitamine D3 500/400", "Calcitonine (spray nasal)",
      ]},
    ]
  },
  {
    id: "cat-08", code: "08", name: "SYSTÈME NERVEUX AUTONOME", icon: "⚡", color: "#eab308",
    subcategories: [
      { id: "08-a", letter: "A", name: "CHOLINERGIQUES", drugs: [
        "Néostigmine 15mg", "Pyridostigmine 60mg", "Pilocarpine 2% (collyre)",
        "Atropine 0.5mg (inj)", "Scopolamine (patch)",
      ]},
      { id: "08-b", letter: "B", name: "ADRÉNERGIQUES", drugs: [
        "Adrénaline 1mg (inj)", "Noradrénaline (inj)",
        "Phényléphrine 10mg", "Clonidine 0.15mg",
      ]},
    ]
  },
  {
    id: "cat-09", code: "09", name: "SYSTÈME HÉMATOLOGIQUE", icon: "🩸", color: "#b91c1c",
    subcategories: [
      { id: "09-a", letter: "A", name: "HÉMATINIQUES", drugs: [
        "Fer (sulfate ferreux) 200mg", "Fer injectable (Venofer)", "Acide Folique 5mg",
        "Vitamine B12 1000mcg (inj)", "Érythropoïétine (inj)",
      ]},
      { id: "09-b", letter: "B", name: "ANTICOAGULANTS", drugs: [
        "Héparine sodique (inj)", "Enoxaparine 40mg (inj)",
        "Warfarine 5mg", "Acénocoumarol 4mg",
        "Rivaroxaban 20mg", "Apixaban 5mg",
      ]},
      { id: "09-c", letter: "C", name: "FIBRINOLYTIQUES", drugs: [
        "Altéplase (inj)", "Streptokinase (inj)", "Acide Tranexamique 500mg",
      ]},
    ]
  },
  {
    id: "cat-10", code: "10", name: "APPAREIL URINAIRE ET RÉNAL", icon: "🫘", color: "#a855f7",
    subcategories: [
      { id: "10-a", letter: "A", name: "DIURÉTIQUES", drugs: [
        "Furosémide 40mg", "Hydrochlorothiazide 25mg", "Spironolactone 25mg", "Indapamide 1.5mg",
      ]},
      { id: "10-b", letter: "B", name: "MALADIES RÉNALES", drugs: [
        "Érythropoïétine (inj)", "Sevelamer 800mg", "Calcium Carbonate 500mg",
        "Alfacalcidol 0.25mcg", "Tamsulosine 0.4mg", "Alfuzosine 10mg",
      ]},
    ]
  },
  {
    id: "cat-11", code: "11", name: "SANTÉ DE LA REPRODUCTION", icon: "👶", color: "#f472b6",
    subcategories: [
      { id: "11-a", letter: "A", name: "CONTRACEPTIFS", drugs: [
        "Éthinylestradiol/Lévonorgestrel", "Désogestrel 75mcg",
        "Médroxyprogestérone (inj)", "Lévonorgestrel d'urgence 1.5mg",
      ]},
      { id: "11-b", letter: "B", name: "OBSTÉTRIQUE ET INFERTILITÉ", drugs: [
        "Oxytocine (inj)", "Misoprostol 200mcg",
        "Progestérone 200mg", "Clomifène 50mg",
        "Acide Folique 5mg (grossesse)", "Sulfate de Magnésium (inj)",
      ]},
    ]
  },
  {
    id: "cat-12", code: "12", name: "AGENTS ANTINÉOPLASIQUES", icon: "🎗️", color: "#6366f1",
    subcategories: [
      { id: "12-a", letter: "A", name: "AGENTS ALKYLANTS", drugs: [
        "Cyclophosphamide 50mg", "Cisplatine (inj)", "Carboplatine (inj)",
      ]},
      { id: "12-b", letter: "B", name: "ANTIMÉTABOLITES", drugs: [
        "Méthotrexate 2.5mg", "5-Fluorouracile (inj)", "Capécitabine 500mg",
      ]},
      { id: "12-c", letter: "C", name: "HORMONOTHÉRAPIE", drugs: [
        "Tamoxifène 20mg", "Anastrozole 1mg", "Létrozole 2.5mg",
      ]},
      { id: "12-d", letter: "D", name: "IMMUNOTHÉRAPIE", drugs: [
        "Rituximab (inj)", "Trastuzumab (inj)", "Pembrolizumab (inj)",
      ]},
    ]
  },
  {
    id: "cat-13", code: "13", name: "AGENTS IMMUNOLOGIQUES", icon: "🛡️", color: "#14b8a6",
    subcategories: [
      { id: "13-a", letter: "A", name: "IMMUNOSUPPRESSEURS", drugs: [
        "Ciclosporine 100mg", "Azathioprine 50mg", "Mycophénolate 500mg", "Tacrolimus 1mg",
      ]},
      { id: "13-b", letter: "B", name: "IMMUNOSTIMULANTS", drugs: [
        "Interféron alpha", "Interféron bêta", "G-CSF (Filgrastim)",
      ]},
      { id: "13-c", letter: "C", name: "VACCINS", drugs: [
        "Vaccin anti-grippal", "Vaccin anti-pneumococcique", "Vaccin anti-hépatite B",
        "Vaccin antitétanique", "Vaccin anti-COVID",
      ]},
    ]
  },
  {
    id: "cat-14", code: "14", name: "VITAMINES, MINÉRAUX ET SUPPLÉMENTS", icon: "💊", color: "#22c55e",
    subcategories: [
      { id: "14-a", letter: "A", name: "VITAMINES ET MINÉRAUX", drugs: [
        "Vitamine C 1g", "Vitamine C 500mg", "Vitamine D3 1000UI", "Vitamine D3 5000UI",
        "Vitamine B Complex", "Vitamine B12 1000mcg", "Vitamine E 400UI", "Vitamine K1 10mg",
        "Acide Folique 5mg",
        "Calcium 500mg", "Calcium/Vitamine D3 500/400",
        "Fer (Fer 33mg/ml)", "Fer (sulfate ferreux) 200mg",
        "Magnésium 300mg", "Zinc 15mg", "Potassium (KCl) 600mg",
      ]},
    ]
  },
  {
    id: "cat-15", code: "15", name: "AGENTS DERMATOLOGIQUES", icon: "🧴", color: "#f97316",
    subcategories: [
      { id: "15-a", letter: "A", name: "CORTICOSTÉROÏDES TOPIQUES", drugs: [
        "Hydrocortisone 1% (crème)", "Bétaméthasone 0.05% (crème)",
        "Clobétasol 0.05% (crème)", "Mométasone (crème)",
      ]},
      { id: "15-b", letter: "B", name: "ANTIBACTÉRIENS TOPIQUES", drugs: [
        "Acide Fusidique 2% (crème)", "Mupirocine 2% (pommade)",
        "Sulfadiazine argentique 1% (crème)",
      ]},
      { id: "15-c", letter: "C", name: "ANTIFONGIQUES TOPIQUES", drugs: [
        "Kétoconazole 2% (crème)", "Clotrimazole 1% (crème)",
        "Terbinafine 1% (crème)", "Miconazole 2% (crème)",
      ]},
    ]
  },
  {
    id: "cat-16", code: "16", name: "AGENTS OPHTALMIQUES ET OTIQUES", icon: "👁️", color: "#0ea5e9",
    subcategories: [
      { id: "16-a", letter: "A", name: "OPHTALMIQUES ET OTIQUES", drugs: [
        "Tobramycine 0.3% (collyre)", "Ciprofloxacine 0.3% (collyre)",
        "Dexaméthasone 0.1% (collyre)", "Timolol 0.5% (collyre)",
        "Larmes artificielles", "Tropicamide 1% (collyre)",
        "Ciprofloxacine/Dexaméthasone (gouttes otiques)",
        "Ofloxacine (gouttes otiques)",
      ]},
    ]
  },
  {
    id: "cat-17", code: "17", name: "AGENTS DIAGNOSTIQUES", icon: "🔬", color: "#64748b",
    subcategories: [
      { id: "17-a", letter: "A", name: "MÉDIAS DE CONTRASTE", drugs: [
        "Iohexol (produit de contraste)", "Gadobutrol (IRM)",
        "Baryum sulfate (oral)", "Technétium-99m",
      ]},
    ]
  },
  {
    id: "cat-18", code: "18", name: "DIVERS", icon: "🏥", color: "#71717a",
    subcategories: [
      { id: "18-a", letter: "A", name: "ANTIDOTES", drugs: [
        "N-Acétylcystéine (antidote paracétamol)", "Naloxone (antidote opioïdes)",
        "Flumazénil (antidote benzodiazépines)", "Charbon activé",
        "Atropine (antidote organophosphorés)",
      ]},
      { id: "18-b", letter: "B", name: "ENZYMES", drugs: [
        "Pancréatine", "Alpha-galactosidase",
      ]},
      { id: "18-c", letter: "C", name: "DÉSINFECTANTS", drugs: [
        "Povidone iodée (Bétadine)", "Chlorhexidine solution",
        "Eau oxygénée 3%", "Alcool 70°",
      ]},
      { id: "18-d", letter: "D", name: "GAZ MÉDICAUX", drugs: [
        "Oxygène médical", "Protoxyde d'azote",
      ]},
    ]
  },
];

// Build a flat list for backward compatibility with search
export function getAllDrugs(): string[] {
  const set = new Set<string>();
  MEDICATION_CATALOG.forEach(cat =>
    cat.subcategories.forEach(sub =>
      sub.drugs.forEach(d => set.add(d))
    )
  );
  return Array.from(set).sort();
}
