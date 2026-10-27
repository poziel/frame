import './styles/index.css';

export {default as UniversalViewer} from './components/UniversalViewer.vue';
export {default as UniversalViewerContent} from './components/UniversalViewerContent.vue';
export {detectViewerType, viewerFileName} from './services/viewer';
export type {
  ViewerSource,
  ViewerFile,
  ViewerKind,
  ViewerType,
} from './types/viewerTypes';

export {ViewerController} from './controllers/viewerController';
export type {ViewerControllerOptions} from './controllers/viewerController';
