import {
  createFrame,
  Layout,
  DockRegistry,
  type DockController,
} from '@frame/core';

const frame = createFrame();
const layout: Layout = frame.layout;
layout.primaryWidth = 260;
const geometry = layout.geometry(1200, 800);
const maximized = layout.maximizedBounds(1200, 800);
void geometry.center;
void maximized?.width;
const registry: DockRegistry = frame.docks;
const controller: DockController = registry;
controller.hide('tools');
// @ts-expect-error Panel positions are a closed set of physical edges.
layout.panelPosition = 'floating';
// @ts-expect-error Dock registration storage is private.
void registry.entries;
frame.dispose();
