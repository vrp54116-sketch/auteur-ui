export interface Direction {
  id: string;
  look: string;
  headline: string;
  sub: string;
  cta: string;
  mood: string;
}

export type TaskType = 'music' | 'dashboard' | 'landing' | 'editorial';

export interface TaskBrief {
  id?: string;
  type?: TaskType | string;
  prompt?: string;
  title?: string;
}

export interface PreviewRenderOptions {
  title?: string;
  offline?: boolean;
}

