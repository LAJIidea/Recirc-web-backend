export type TFolder = {
  id: string;
  type: "folder";
  name: string;
  children: (TFile | TFolder)[];
}

export type TFile = {
  id: string;
  type: "file";
  name: string;
};
  
export type TFileData = {
  id: string;
  data: string;
};

export type MinIOFiles = {
  objects: MinIOFileData[];
  truncated: boolean;
  delimitedPrefixes: any[];
};

export type MinIOFileData = {
  storageClass: string;
  uploaded: string;
  checksums: any;
  httpEtag: string;
  etag: string;
  size: number;
  version: string;
  key: string;
};

export type R2FileBody = MinIOFileData & {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer: Promise<ArrayBuffer>;
  text: Promise<string>;
  json: Promise<any>;
  blob: Promise<Blob>;
};

export type ComposeFilesData = {
  files: (TFile | TFolder)[];
  fileData: TFileData[]
}