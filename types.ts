
export type NavigationTab = 'search' | 'knowledge' | 'model' | 'settings';

export interface Model {
  id: string;
  name: string;
  version: string;
  size: string;
  type: string;
  status: 'enabled' | 'idle' | 'downloading';
  progress?: number;
}

export interface SearchResult {
  title: string;
  content: string;
  sources: { name: string; url: string; snippet: string; icon: string }[];
  modelName: string;
}

export interface Activity {
  id: string;
  title: string;
  context: string;
  time: string;
  type: 'doc' | 'pdf' | 'link';
}
