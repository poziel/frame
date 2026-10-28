import ts from 'typescript';
import {createComponentExtractor} from './component-contracts';
import {generalFamilies} from '../src/examples/generalCatalog';
import {formFamilies} from '../src/examples/formCatalog';
import {coreComponentSource} from '../src/examples/componentGroups';
import {readFileSync, existsSync} from 'node:fs';
import {writeGeneratedFile as writeFileSync} from './generated-file';
import {resolve, relative} from 'node:path';

const root = resolve(import.meta.dir, '../../..');
const core = 'packages/core/src/components/';
const extra = 'packages/core/src/modules/';
export const pageSources: Record<string, string[]> = {
  'file-upload': [core + 'FrameFileUpload.vue'],
  'file-drop-zone': [core + 'FrameFileDropZone.vue'],
  'universal-viewer': [
    extra + 'viewer/components/UniversalViewer.vue',
    extra + 'viewer/components/UniversalViewerContent.vue',
  ],
  buttons: [core + 'FrameButton.vue'],
  'icon-buttons': [core + 'FrameIconButton.vue'],
  'text-input': [core + 'FrameTextField.vue'],
  checkbox: [core + 'FrameCheckbox.vue'],
  select: [core + 'FrameSelect.vue'],
  slider: [core + 'FrameSlider.vue'],
  'color-picker': [core + 'FrameColorPicker.vue'],
  'text-area': [core + 'FrameTextArea.vue'],
  'setting-controls': [core + 'SettingControl.vue'],
  icons: [core + 'FrameIcon.vue'],
  tooltips: [core + 'FrameTooltip.vue'],
  menus: [core + 'FrameDropdownMenu.vue'],
  'context-menu': [core + 'ContextMenu.vue'],
  'resizable-panes': [core + 'ResizablePane.vue'],
  'resize-handle': [core + 'ResizeHandle.vue'],
  modals: [core + 'FrameModal.vue'],
  settings: [core + 'FrameSettings.vue'],
  notifications: [core + 'FrameNotifications.vue'],
  'notification-panel': [
    extra + 'notifications/components/NotificationPanel.vue',
    extra + 'notifications/components/NotificationIndicator.vue',
  ],
  'quick-input': [core + 'FrameQuickPick.vue'],
  'quick-panel': [core + 'FrameQuickPanel.vue'],
  banner: [core + 'FrameShell.vue'],
  workspace: [core + 'WorkspacePanes.vue'],
  views: [core + 'SidePanel.vue', core + 'ViewSections.vue'],
  'navigation-items': [
    core + 'NavigationBar.vue',
    core + 'NavigationItemMenu.vue',
  ],
  navigation: [core + 'FrameShell.vue'],
  loader: [core + 'FrameLoader.vue'],
  loading: [core + 'FrameLoading.vue'],
  'code-block': [core + 'FrameCodeBlock.vue'],
  'code-editor': [extra + 'editor/components/CodeEditor.vue'],
  terminal: [
    extra + 'terminal/components/Terminal.vue',
    extra + 'terminal/components/TerminalView.vue',
  ],
  'ai-chat': [extra + 'chat/components/AIChat.vue'],
  'ai-view': [extra + 'chat/components/AIChat.vue'],
  'ai-history': [extra + 'chat/components/AIHistory.vue'],
  'ai-prompt': [extra + 'chat/components/AIPrompt.vue'],
  'ai-conversation': [extra + 'chat/components/AIConversation.vue'],
};
for (const [id, name] of formFamilies)
  pageSources[id] = [core + 'Frame' + name + '.vue'];
for (const [id, name] of generalFamilies)
  pageSources['general-' + id] = [core + 'Frame' + name + '.vue'];
for (const [id, sources] of Object.entries(pageSources))
  pageSources[id] = sources.map((source) =>
    source.startsWith(core)
      ? coreComponentSource(source.split('/').pop()!)
      : source
  );
const files = [...new Set(Object.values(pageSources).flat())];
const script = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join('\n');
const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
  baseUrl: root,
  paths: {'@frame/core': ['packages/core/src/index.ts']},
};
const host = ts.createCompilerHost(options);
const originalRead = host.readFile.bind(host),
  originalExists = host.fileExists.bind(host);
host.fileExists = (file) =>
  file.endsWith('.vue.ts')
    ? existsSync(file.slice(0, -3))
    : originalExists(file);
host.readFile = (file) =>
  file.endsWith('.vue.ts') ? script(file.slice(0, -3)) : originalRead(file);
const featureFactories: Record<string, {file: string; name: string}> = {
  'ai-chat': {file: extra + 'chat/controllers/aiChat.ts', name: 'createAIChat'},
  'ai-conversation': {
    file: extra + 'chat/controllers/aiChat.ts',
    name: 'createAIChat',
  },
  'ai-view': {
    file: extra + 'chat/integrations/aiChatView.ts',
    name: 'createAIChatView',
  },
  'ai-history': {
    file: extra + 'chat/controllers/aiChatHistory.ts',
    name: 'createAIChatHistory',
  },
};
const program = ts.createProgram(
  [
    resolve(root, 'packages/core/src/framework/frame.ts'),
    ...files.map((file) => resolve(root, file) + '.ts'),
    ...Object.values(featureFactories).map((item) => resolve(root, item.file)),
  ],
  options,
  host
);
const checker = program.getTypeChecker();
/** Reads the declaration comment without inventing descriptions from names. */
function describe(_name: string, symbol?: ts.Symbol) {
  return symbol
    ? ts.displayPartsToString(symbol.getDocumentationComment(checker))
    : '';
}
const extractComponent = createComponentExtractor(root);
const contracts = Object.fromEntries(
  files.map((file) => [file, extractComponent(file)])
);
const diagnostics = Object.entries(contracts).flatMap(([source, contract]) =>
  contract.diagnostics.map((message) => `${source}: ${message}`)
);
if (diagnostics.length)
  throw new Error(
    `Component documentation contracts are incomplete:\n${diagnostics.join('\n')}`
  );
const serviceSpecs: Record<
  string,
  {name: string; type: string; source: string}
> = {
  notifications: {
    name: 'frame.notify',
    type: 'NotificationOptions',
    source: 'packages/core/src/framework/views/notifications.ts',
  },
  modals: {
    name: 'frame.openModal',
    type: 'ModalDefinition',
    source: 'packages/core/src/components/framework/modal.ts',
  },
  settings: {
    name: 'frame.registerSettingsSection',
    type: 'SettingsSection',
    source: 'packages/core/src/framework/settings/settings.ts',
  },
  banner: {
    name: 'frame.registerBanner',
    type: 'WorkspaceBannerDefinition',
    source: 'packages/core/src/framework/workspace/workspaceBanner.ts',
  },
  workspace: {
    name: 'frame.setWorkspacePane',
    type: 'WorkspacePaneContent',
    source: 'packages/core/src/framework/workspace/workspaceTypes.ts',
  },
  views: {
    name: 'frame.registerView',
    type: 'SidePanelDefinition',
    source: 'packages/core/src/framework/views/shellViewContainer.ts',
  },
  'navigation-items': {
    name: 'frame.registerNavigationItem',
    type: 'NavigationItem',
    source: 'packages/core/src/framework/views/navigationItems.ts',
  },
  'quick-input': {
    name: 'frame.showQuickPick',
    type: 'QuickPickOptions',
    source: 'packages/core/src/components/framework/quickPick.ts',
  },
};
const services: Record<string, unknown> = {};
for (const [id, spec] of Object.entries(serviceSpecs)) {
  const sf = program.getSourceFile(resolve(root, spec.source));
  if (!sf) throw new Error('Missing service source: ' + spec.source);
  const node = sf.statements.find(
    (node) =>
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === spec.type
  );
  if (!node) throw new Error('Missing service contract: ' + spec.type);
  const props = checker
    .getPropertiesOfType(checker.getTypeAtLocation(node))
    .map((symbol) => {
      const decl = symbol.valueDeclaration ?? symbol.declarations![0]!;
      const display =
        (decl as ts.PropertySignature).type?.getText() ?? 'unknown';
      const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
      const branches = type.isUnion() ? type.types : [type];
      const choices = branches
        .filter((t) => t.isStringLiteral())
        .map((t) => (t as ts.StringLiteralType).value);
      const fixture =
        /Component|NotificationAction/.test(display) || display.includes('=>');
      let value: unknown =
        symbol.flags & ts.SymbolFlags.Optional
          ? {kind: 'omitted'}
          : {kind: 'required'};
      if (id === 'notifications' && symbol.name === 'duration')
        value = {kind: 'literal', value: '5000'};
      if (id === 'notifications' && symbol.name === 'severity')
        value = {kind: 'literal', value: '"info"'};
      return {
        name: symbol.name,
        type: display,
        default: value,
        description: describe(symbol.name, symbol),
        options: choices.length ? choices : undefined,
        control: fixture
          ? 'fixture'
          : display === 'boolean'
            ? 'boolean'
            : display === 'number'
              ? 'number'
              : display === 'string' || choices.length
                ? 'text'
                : 'json',
        references: [...new Set(display.match(/\b[A-Z][A-Za-z0-9]+\b/g) ?? [])],
      };
    });
  if (id === 'views')
    props.push({
      name: 'region',
      type: 'ViewRegion',
      default: {kind: 'required'},
      description: 'Shell region in which to register the view.',
      options: ['primary', 'secondary', 'bottom'],
      control: 'text',
      references: ['ViewRegion'],
    });
  const frameSource = program.getSourceFile(
    resolve(root, 'packages/core/src/framework/frame.ts')
  )!;
  const frameNode = frameSource.statements.find(
    (node): node is ts.ClassDeclaration =>
      ts.isClassDeclaration(node) && node.name?.text === 'Frame'
  )!;
  const frameType = checker.getTypeAtLocation(frameNode);
  const methodName = spec.name.slice('frame.'.length);
  const methodSymbol = checker.getPropertyOfType(frameType, methodName);
  if (!methodSymbol) throw new Error('Missing public Frame API: ' + spec.name);
  const methodDeclaration =
    methodSymbol.valueDeclaration ?? methodSymbol.declarations![0]!;
  const methodType = checker.getTypeOfSymbolAtLocation(
    methodSymbol,
    methodDeclaration
  );
  const signature = methodType.getCallSignatures()[0];
  if (!signature)
    throw new Error('Non-callable public Frame API: ' + spec.name);
  const format =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const parameters = signature.parameters
    .map((parameter) => {
      const declaration =
        parameter.valueDeclaration ?? parameter.declarations![0]!;
      const optional =
        ts.isParameter(declaration) &&
        (declaration.questionToken || declaration.initializer);
      return `${parameter.name}${optional ? '?' : ''}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, declaration), declaration, format)}`;
    })
    .join(', ');
  services[id] = {
    name: spec.name,
    source: spec.source,
    props,
    emits: [],
    slots: [],
    forwardsAttrs: false,
    methods: [
      {
        name: spec.name,
        kind: 'method',
        parameters,
        signature: checker.signatureToString(
          signature,
          methodDeclaration,
          format
        ),
        returns: checker.typeToString(
          signature.getReturnType(),
          methodDeclaration,
          format
        ),
        description: describe(methodName, methodSymbol),
      },
    ],
  };
}
for (const [id, spec] of Object.entries(featureFactories)) {
  const sf = program.getSourceFile(resolve(root, spec.file))!;
  const fn = sf.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === spec.name
  ) as ts.FunctionDeclaration;
  const signature = checker.getSignatureFromDeclaration(fn)!;
  const param = signature.parameters[0]!;
  const paramType = checker.getTypeOfSymbolAtLocation(param, fn);
  const format =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const props = checker.getPropertiesOfType(paramType).map((symbol) => {
    const decl = symbol.valueDeclaration ?? symbol.declarations![0]!;
    const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
    const display = checker.typeToString(type, decl, format);
    return {
      name: symbol.name,
      type: display,
      default: {
        kind: symbol.flags & ts.SymbolFlags.Optional ? 'omitted' : 'required',
      },
      description: describe(symbol.name, symbol),
      control: 'fixture',
      references: [...new Set(display.match(/\b[A-Z][A-Za-z0-9]+\b/g) ?? [])],
    };
  });
  const result = signature.getReturnType();
  const methods = [
    {
      name: spec.name,
      kind: 'method',
      parameters: fn.parameters.map((p) => p.getText(sf)).join(', '),
      returns: checker.typeToString(result, fn, format),
      description: ts.displayPartsToString(
        checker
          .getSymbolAtLocation(fn.name!)
          ?.getDocumentationComment(checker) ?? []
      ),
    },
  ];
  if (id !== 'ai-view')
    for (const symbol of checker.getPropertiesOfType(result)) {
      const decl = symbol.valueDeclaration ?? symbol.declarations![0]!;
      const type = checker.getTypeOfSymbolAtLocation(symbol, decl),
        call = type.getCallSignatures()[0];
      methods.push({
        name: symbol.name,
        kind: call ? 'method' : 'property',
        parameters: call
          ? call.parameters
              .map(
                (p) =>
                  p.name +
                  ': ' +
                  checker.typeToString(
                    checker.getTypeOfSymbolAtLocation(p, decl),
                    decl,
                    format
                  )
              )
              .join(', ')
          : '',
        returns: checker.typeToString(
          call ? call.getReturnType() : type,
          decl,
          format
        ),
        description: describe(symbol.name, symbol),
      });
    }
  services[id] = {
    name: spec.name,
    source: spec.file,
    props,
    methods,
    emits: [],
    slots: [],
    forwardsAttrs: false,
  };
}
writeFileSync(
  resolve(root, 'packages/docs/src/examples/documentation/services.json'),
  JSON.stringify(services, null, 2) + '\n'
);
const referenced = new Set<string>();
for (const spec of Object.values(serviceSpecs)) referenced.add(spec.type);
for (const contract of [
  ...Object.values(contracts),
  ...Object.values(services),
] as {props: {references: string[]}[]}[])
  for (const prop of contract.props)
    for (const name of prop.references) referenced.add(name);
const references: Record<string, unknown> = {};
for (const sf of program.getSourceFiles()) {
  const path = relative(root, sf.fileName).replace(/\\/g, '/');
  if (
    !path.startsWith('packages/core/src/') &&
    !path.includes('/reka-ui/') &&
    !path.includes('/@internationalized/date/')
  )
    continue;
  for (const node of sf.statements) {
    if (
      !(
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)
      ) ||
      !referenced.has(node.name.text)
    )
      continue;
    const name = node.name.text;
    const props = ts.isInterfaceDeclaration(node)
      ? node.members.filter(ts.isPropertySignature).map((member) => ({
          name: member.name.getText(sf),
          type: member.type?.getText(sf) ?? 'unknown',
          description: describe(
            member.name.getText(sf),
            checker.getSymbolAtLocation(member.name)
          ),
          ...(member.questionToken ? {} : {}),
        }))
      : [];
    references[name] = {
      description: describe(name, checker.getSymbolAtLocation(node.name)),
      usage: `Import ${name} from ${path.includes('/reka-ui/') ? 'reka-ui' : path.includes('/@internationalized/date/') ? '@internationalized/date' : path.includes('/modules/') ? '@frame/core/modules/' + path.split('/modules/')[1]!.split('/')[0] : '@frame/core'}. The definition below is the source contract; optional fields may be omitted.`,
      code: node.getText(sf),
      properties: props,
      package: ['DateValue', 'DateRange', 'TimeValue', 'TimeRange'].includes(
        name
      )
        ? '@frame/core'
        : path.includes('/reka-ui/')
          ? 'reka-ui'
          : path.includes('/@internationalized/date/')
            ? '@internationalized/date'
            : path.includes('/modules/')
              ? '@frame/core/modules/' +
                path.split('/modules/')[1]!.split('/')[0]
              : '@frame/core',
    };
  }
}
writeFileSync(
  resolve(root, 'packages/docs/src/examples/documentation/references.json'),
  JSON.stringify(references, null, 2) + '\n'
);
const output = resolve(
  root,
  'packages/docs/src/examples/documentation/contracts.json'
);
writeFileSync(output, JSON.stringify({pageSources, contracts}, null, 2) + '\n');
console.log(`Extracted ${files.length} component contracts`);
