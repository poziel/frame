<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import { FrameButton, FrameCodeBlock, useFrame } from '@frame/core';
import { guidePages, type GuidePageId } from './pages';
import { setupExample, viewExample } from './examples';
import { openGuide, guidesViewId } from './navigation';
const props=defineProps<{pageId:GuidePageId}>();
const frame=useFrame();
const article=ref<HTMLElement>();
async function scrollToStart(){await nextTick();article.value?.scrollIntoView({block:"start",inline:"nearest"});}
onMounted(scrollToStart);watch(()=>props.pageId,scrollToStart);
const page=computed(()=>guidePages.find(item=>item.id===props.pageId)!);
function navigate(id:GuidePageId){openGuide(frame,id);frame.openSidePanel(guidesViewId);}
function components(){history.replaceState(null,'',location.pathname+location.search);frame.openSidePanel('demo.components');}
</script>
<template>
 <article ref="article" class="frame-guide-page">
  <header><p class="showcase-eyebrow">FRAME · INTRODUCTION</p><h1>{{ page.title }}</h1><p class="frame-guide-lead">{{ page.summary }}</p></header>
  <template v-if="pageId==='overview'">
   <section><h2>Your application, inside a shared workbench</h2><p>Frame gives a Vue application a coordinated shell: sidebars, panels, workspace panes, menus, commands, settings, and notifications. Your application supplies the views and the work people do inside them.</p><p>A root Frame instance controls that workbench. FrameShell renders it. You register content and call the instance’s APIs to change what appears, where it appears, and which view is active.</p></section>
   <section><h2>Two parts that work together</h2><dl><div><dt>The application shell</dt><dd>Frame coordinates layout, navigation, registered views, and shared shell state. Open a sidebar, split a workspace, run a command, or show a notification through the same instance.</dd></div><div><dt>Reusable components</dt><dd>Build the content of your views with Frame’s buttons, fields, menus, and other themed controls. Ordinary controls can be used without creating a Frame instance.</dd></div></dl></section>
   <section><h2>Your application keeps its own responsibilities</h2><p>You own domain data, business rules, backend connections, credentials, and persistence policy. Frame manages presentation and the shell resources registered with it. Each Frame instance has its own state and lifecycle.</p></section>
   <section><h2>A typical interaction</h2><ol><li>Your application creates a Frame instance and renders FrameShell.</li><li>It contributes Vue views, menus, and commands.</li><li>A user action calls a command or an instance method.</li><li>Frame updates its state, and the shell presents the result.</li></ol></section>
   <section><h2>Explore Frame</h2><div class="frame-guide-links"><button v-for="item in guidePages.slice(1)" :key="item.id" @click="navigate(item.id)"><strong>{{ item.title }}</strong><span>{{ item.summary }}</span></button></div><FrameButton variant="secondary" icon="symbol-class" @click="components">Browse components</FrameButton></section>
   <p class="frame-guide-note">Frame’s workbench is inspired by VS Code. Frame is an independent project and is not affiliated with Microsoft or Visual Studio Code.</p>
  </template>
  <template v-else-if="pageId==='getting-started'">
   <section><h2>Create the root instance</h2><p>Add @frame/core through your project’s package source or workspace. Import its stylesheet once, create an instance, and pass it to FrameShell. This example places an application-owned ProjectView in the initial workspace.</p><FrameCodeBlock :code="setupExample" language="vue" label="Minimal Frame application" :line-numbers="true"/></section>
   <section><h2>Contribute a view</h2><p>Workspace content uses setWorkspacePane. Sidebar and bottom-panel contributions use registerView. Inside the shell’s component tree, useFrame returns the same instance supplied to FrameShell.</p><FrameCodeBlock :code="viewExample" language="typescript" label="Register a sidebar view" :line-numbers="true"/></section>
   <section><h2>Build the content</h2><p>Compose your view with application components and Frame controls. Use props, events, and slots for ordinary controls; use the root instance when an interaction needs to open, move, or control shell content.</p></section>
   <section><h2>Clean up what you register</h2><p>Keep the unregister functions returned by registrations. Call them when the contribution ends, and dispose the root instance when the host application tears down. Backend resources owned by your application still need their own cleanup.</p></section>
   <div class="frame-guide-actions"><FrameButton variant="secondary" @click="navigate('how-it-works')">Understand the architecture</FrameButton><FrameButton @click="components">Browse components</FrameButton></div>
  </template>
  <template v-else-if="pageId==='hosts'">
   <section><h2>A Vue and TypeScript framework</h2><p>Frame and this browser documentation require no Rust toolchain. Core defines portable host contracts; your application supplies native behavior through optional adapters.</p></section>
   <section><h2>Browser defaults</h2><p>createFrame() uses browser file selection, external URL opening, and document fullscreen. Browser-selected entries contain a File object and no filesystem path. Minimize, maximize, native close, and file-manager reveal are unavailable.</p><FrameCodeBlock language="typescript" :code="`const frame = createFrame();\nconst files = await frame.host.files?.pick({ multiple: true, accept: '.png,.jpg' });\nawait frame.host.external?.openUrl('https://example.com');`" /></section>
   <section><h2>Tauri</h2><p>Install @frame/tauri alongside Core. The consuming application owns its native window, permissions, and dialog/opener plugin registration. Pass files: false or external: false to omit services your host does not install.</p><FrameCodeBlock language="typescript" :code="`import { createFrame } from '@frame/core';\nimport { createTauriHost } from '@frame/tauri';\nconst frame = createFrame({ host: createTauriHost() });`" /></section>
   <section><h2>Electron</h2><p>@frame/electron supplies createElectronHost for the renderer, exposeElectronHost from its preload entry point, and installElectronHost from its main entry point. Keep context isolation enabled. Main-process setup requires an explicit window/URL authorization policy; local file opening and reveal additionally require an allowPath policy.</p><FrameCodeBlock language="typescript" :code="`import { createElectronHost } from '@frame/electron';\nconst frame = createFrame({ host: createElectronHost(window.frameHost) });`" /></section>
   <section><h2>Capabilities and lifecycle</h2><p>Implement FrameHost for other environments. Window, file selection, and external opening are separate services. Optional window methods define capabilities, so UI actions and API calls use the same supported behavior. Frame releases its subscriptions on disposal; your application retains ownership of host services.</p><p>Close means close the current window. File selection, opening in an external application, and revealing in a file manager are distinct operations. Native file references contain paths; file reading and persistence policy remain host responsibilities.</p></section>
   <section><h2>Terminal execution is separate</h2><p>Supply a TerminalBackend explicitly to createTerminal({ backend }). The frontend display can use a backend written in any language or a remote service. This Docs application uses a simulated command backend. The optional Rust PTY implementation lives in the separate Frame Native companion.</p></section>
  </template>
  <template v-else>
   <section><h2>One root instance, one rendered shell</h2><p>createFrame creates the public coordinator and its per-instance state. FrameShell receives that instance and renders the workbench. Descendant views access it through useFrame, so UI actions and application code can use the same commands and services.</p></section>
   <section><h2>Content and placement are separate</h2><p>A view definition supplies a Vue component and its metadata. Registration tells Frame where that contribution belongs. Workspace APIs manage panes and their content; view APIs manage sidebar and panel contributions. Your view can focus on its own interface.</p></section>
   <section><h2>Packages follow responsibility</h2><dl><div><dt>@frame/core</dt><dd>The root instance, shell, shared APIs, and reusable visual components.</dd></div><div><dt>@frame/core/modules/*</dt><dd>Module entry points in the same Core package: chat, terminal, viewer, editor, and notification history. Import the modules your application needs and manage their explicit lifecycle.</dd></div><div><dt>@frame/tailwind</dt><dd>Optional build integration for application utilities. Generated utilities reference Frame theme variables; Tailwind is configured at build time.</dd></div></dl></section>
   <section><h2>One theme across the interface</h2><p>The shell and controls share --frame-* CSS variables for colors, fonts, spacing, radii, and other presentation choices. Application views can use the same variables so content follows the selected theme.</p></section>
   <section><h2>Current APIs and future direction</h2><p>These guides use the implemented registration and workspace APIs. Typed extension installation through frame.use and feature factories on the root instance remain architectural proposals. They are not required to use the current packages.</p></section>
   <div class="frame-guide-actions"><FrameButton variant="secondary" @click="navigate('getting-started')">Create your first view</FrameButton><FrameButton @click="navigate('overview')">Back to introduction</FrameButton></div>
  </template>
 </article>
</template>
