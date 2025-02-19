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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNextChapter: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPrevChapter: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFirstPage: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLastPage: () => any;
}
