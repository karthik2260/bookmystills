import { ReactNode } from "react";


export interface DynamicBackgroundProps {
  filepath: string;
  type?: 'video' | 'image';
  height?: string;
  width?: string;
  imageData?: string | null;
  className?: string;
  text?:string;
  textClassName?: string;
}

export interface ExtendedDynamicBackgroundProps extends DynamicBackgroundProps {
  text?: string;
  textClassName?: string;
  children?: ReactNode;
}