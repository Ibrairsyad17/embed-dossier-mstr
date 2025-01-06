export interface TableOfContents {
  chapters: DossierChapter[];
}

export interface DossierPage {
  name: string;
  nodeKey: string;
}

export interface DossierChapter {
  name: string;
  nodeKey: string;
  pages: DossierPage[];
}
