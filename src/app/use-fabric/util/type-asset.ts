import { fabric } from 'fabric';

export const isRect = (obj: fabric.Object): obj is fabric.Rect => {
  return obj.type === 'rect';
};

export const isTextbox = (obj: fabric.Object): obj is fabric.Textbox => {
  return obj.type === 'textbox';
};
