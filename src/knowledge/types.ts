export type Dataset = {
  titel: string;
  type: string;
  eenheid: string;
  deler: number;
  decimalen: number;
  labels: (string | number)[];
  reeksen: {
    naam: string;
    waarden: (number | null)[];
    status?: string[];
    peildatum?: (string | number)[];
    bronvlag?: string[];
  }[];
  bron: {
    naam: string;
    url: string;
    titel?: string;
    tabel?: string;
    periode?: string;
    gewijzigd?: string;
    opgehaald?: string;
    licentie?: string;
  };
  toelichting: string;
  leeg: boolean;
  voorlopig?: number[];
  berekend?: string;
  bronbestanden?: string[];
  afhankelijkheden?: string[];
  eenheid_verantwoording?: string;
};

export type KnowledgeCatalog = {
  schemaVersion: number;
  provenance: {
    exportRetrievedAt: string;
    datasetRetrievedAt: string;
    source: string;
    rawArchiveIncluded: boolean;
  };
  documents: {
    id: string;
    path: string;
    originalPath: string;
    sha256: string;
    title: string;
    category: string;
    checkedAt: string | null;
    publishedAt: string | null;
    anchors: string[];
    headings: { title: string; anchor: string | null }[];
    text: string;
  }[];
  sources: {
    id: string;
    url: string;
    title: string;
    documentIds: string[];
    datasetIds: string[];
    metadata: Dataset["bron"][];
  }[];
  registeredSourceFiles: {
    path: string;
    datasetIds: string[];
    availableInPublicSnapshot: boolean;
  }[];
  homeCompatibilityAnchors: string[];
};
