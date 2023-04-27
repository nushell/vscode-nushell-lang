/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  Definition,
  HandlerResult,
  SemanticTokensParams,
  SemanticTokensBuilder,
  SemanticTokensClientCapabilities,
  SemanticTokensRegistrationOptions,
  SemanticTokensRegistrationType,
} from "vscode-languageserver/node";

import {
  Position,
  InlayHint,
  InlayHintParams,
  InlayHintLabelPart,
  InlayHintKind,
} from "vscode-languageserver-protocol";

import { TextDocument } from "vscode-languageserver-textdocument";

interface NuTextDocument extends TextDocument {
  nuInlayHints?: InlayHint[];
  nuSemanticTokens?: string[];
}
import fs = require("fs");
import tmp = require("tmp");
import path = require("path");

import util = require("node:util");
import { TextEncoder } from "node:util";
import { fileURLToPath } from "node:url";
import { SemanticTokensLegend } from "vscode";
import { connect } from "http2";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = util.promisify(require("node:child_process").exec);

const tmpFile = tmp.fileSync({ prefix: "nushell", keep: false });

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<NuTextDocument> = new TextDocuments(
  TextDocument
);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

function includeFlagForPath(file_path: string): string {
  if (file_path.startsWith("file://")) {
    file_path = decodeURI(file_path);
    return "-I " + '"' + path.dirname(fileURLToPath(file_path));
  }
  return "-I " + '"' + file_path;
}

connection.onExit(() => {
  tmpFile.removeCallback();
});

// Standard Token Types
// https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers
// ID	            Description
// namespace	    For identifiers that declare or reference a namespace, module, or package.
// class	        For identifiers that declare or reference a class type.
// enum	          For identifiers that declare or reference an enumeration type.
// interface	    For identifiers that declare or reference an interface type.
// struct	        For identifiers that declare or reference a struct type.
// typeParameter	For identifiers that declare or reference a type parameter.
// type	          For identifiers that declare or reference a type that is not covered above.
// parameter	    For identifiers that declare or reference a function or method parameters.
// variable	      For identifiers that declare or reference a local or global variable.
// property	      For identifiers that declare or reference a member property, member field, or member variable.
// enumMember	    For identifiers that declare or reference an enumeration property, constant, or member.
// decorator	    For identifiers that declare or reference decorators and annotations.
// event	        For identifiers that declare an event property.
// function	      For identifiers that declare a function.
// method	        For identifiers that declare a member function or method.
// macro	        For identifiers that declare a macro.
// label	        For identifiers that declare a label.
// comment	      For tokens that represent a comment.
// string	        For tokens that represent a string literal.
// keyword	      For tokens that represent a language keyword.
// number	        For tokens that represent a number literal.
// regexp	        For tokens that represent a regular expression literal.
// operator	      For tokens that represent an operator.
enum TokenTypes {
  shape_and = 0,
  shape_binary = 1,
  shape_block = 2,
  shape_bool = 3,
  shape_closure = 4,
  shape_custom = 5,
  shape_datetime = 6,
  shape_directory = 7,
  shape_external = 8,
  shape_externalarg = 9,
  shape_filepath = 10,
  shape_flag = 11,
  shape_float = 12,
  shape_garbage = 13,
  shape_globpattern = 14,
  shape_int = 15,
  shape_internalcall = 16,
  shape_keyword = 17,
  shape_list = 18,
  shape_literal = 19,
  shape_match_pattern = 20,
  shape_nothing = 21,
  shape_operator = 22,
  shape_or = 23,
  shape_pipe = 24,
  shape_range = 25,
  shape_record = 26,
  shape_redirection = 27,
  shape_signature = 28,
  shape_string = 29,
  shape_string_interpolation = 30,
  shape_table = 31,
  shape_variable = 32,
  shape_vardecl = 33,
  _ = 34,
}

// enum TokenTypes {
//   comment = 0,
//   string = 1,
//   keyword = 2,
//   number = 3,
//   regexp = 4,
//   operator = 5,
//   namespace = 6,
//   type = 7,
//   struct = 8,
//   class = 9,
//   interface = 10,
//   enum = 11,
//   typeParameter = 12,
//   function = 13,
//   method = 14,
//   decorator = 15,
//   macro = 16,
//   variable = 17,
//   parameter = 18,
//   property = 19,
//   label = 20,
//   _ = 21,
// }

// Standard Token Modifiers
// ID	            Description
// declaration	  For declarations of symbols.
// definition	    For definitions of symbols, for example, in header files.
// readonly	      For readonly variables and member fields (constants).
// static	        For class members (static members).
// deprecated	    For symbols that should no longer be used.
// abstract	      For types and member functions that are abstract.
// async	        For functions that are marked async.
// modification	  For variable references where the variable is assigned to.
// documentation	For occurrences of symbols in documentation.
// defaultLibrary	For symbols that are part of the standard library.
enum TokenModifiers {
  declaration = 0,
  documentation = 1,
  readonly = 2,
  static = 3,
  abstract = 4,
  deprecated = 5,
  modification = 6,
  async = 7,
  definition = 8,
  defaultLibrary = 9,
  _ = 10,
}

let semanticTokensLegend: SemanticTokensLegend;
function computeLegend(
  capability: SemanticTokensClientCapabilities
): SemanticTokensLegend {
  const clientTokenTypes = new Set<string>(capability.tokenTypes);
  const clientTokenModifiers = new Set<string>(capability.tokenModifiers);

  const tokenTypes: string[] = [];
  for (let i = 0; i < TokenTypes._; i++) {
    const str = TokenTypes[i];
    if (clientTokenTypes.has(str)) {
      tokenTypes.push(str);
    } else {
      switch (str) {
        case "shape_and":
          tokenTypes.push("operator");
          break;
        case "shape_binary":
          tokenTypes.push("number");
          break;
        case "shape_block":
          tokenTypes.push("operator");
          break;
        case "shape_bool":
          tokenTypes.push("type");
          break;
        case "shape_closure":
          tokenTypes.push("function");
          break;
        case "shape_custom":
          tokenTypes.push("function");
          break;
        case "shape_datetime":
          tokenTypes.push("type");
          break;
        case "shape_directory":
          tokenTypes.push("string");
          break;
        case "shape_external":
          tokenTypes.push("function");
          break;
        case "shape_externalarg":
          tokenTypes.push("parameter");
          break;
        case "shape_filepath":
          tokenTypes.push("string");
          break;
        case "shape_flag":
          tokenTypes.push("parameter");
          break;
        case "shape_float":
          tokenTypes.push("number");
          break;
        case "shape_garbage":
          tokenTypes.push("label");
          break;
        case "shape_globpattern":
          tokenTypes.push("parameter");
          break;
        case "shape_int":
          tokenTypes.push("number");
          break;
        case "shape_internalcall":
          tokenTypes.push("function");
          break;
        case "shape_keyword":
          tokenTypes.push("keyword");
          break;
        case "shape_list":
          tokenTypes.push("type");
          break;
        case "shape_literal":
          tokenTypes.push("type");
          break;
        case "shape_match_pattern":
          tokenTypes.push("parameter");
          break;
        case "shape_nothing":
          tokenTypes.push("keyword");
          break;
        case "shape_operator":
          tokenTypes.push("operator");
          break;
        case "shape_or":
          tokenTypes.push("operator");
          break;
        case "shape_pipe":
          tokenTypes.push("operator");
          break;
        case "shape_range":
          tokenTypes.push("varaiable");
          break;
        case "shape_record":
          tokenTypes.push("type");
          break;
        case "shape_redirection":
          tokenTypes.push("parameter");
          break;
        case "shape_signature":
          tokenTypes.push("interface");
          break;
        case "shape_string":
          tokenTypes.push("string");
          break;
        case "shape_string_interpolation":
          tokenTypes.push("string");
          break;
        case "shape_table":
          tokenTypes.push("keyword");
          break;
        case "shape_variable":
          tokenTypes.push("variable");
          break;
        case "shape_vardecl":
          tokenTypes.push("variable");
          break;
        default:
          tokenTypes.push("variable");
          break;
      }
    }
  }

  const tokenModifiers: string[] = [];
  for (let i = 0; i < TokenModifiers._; i++) {
    const str = TokenModifiers[i];
    if (clientTokenModifiers.has(str)) {
      tokenModifiers.push(str);
    }
  }
  connection.console.log(
    "tokenTypes: " +
      JSON.stringify(tokenTypes) +
      " tokenModifiers: " +
      JSON.stringify(tokenModifiers)
  );
  return { tokenTypes, tokenModifiers };
}

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  semanticTokensLegend = computeLegend(
    params.capabilities.textDocument!.semanticTokens!
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      inlayHintProvider: {
        resolveProvider: false,
      },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

async function durationLogWrapper<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  console.log("Triggered " + label + ": ...");
  console.time(label);
  const result = await fn();

  // This purposefully has the same prefix length as the "Triggered " log above,
  // also does not add a newline at the end.
  process.stdout.write("Finished  ");
  console.timeEnd(label);
  return new Promise<T>((resolve) => resolve(result));
}

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
  const registrationOptions: SemanticTokensRegistrationOptions = {
    documentSelector: ["nushell"],
    legend: semanticTokensLegend,
    range: false,
    full: {
      delta: true,
    },
  };
  void connection.client.register(
    SemanticTokensRegistrationType.type,
    registrationOptions
  );
});

// The nushell settings
interface NushellIDESettings {
  maxNumberOfProblems: number;
  hints: {
    showInferredTypes: boolean;
  };
  nushellExecutablePath: string;
  maxNushellInvocationTime: number;
  includeDirs: string[];
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: NushellIDESettings = {
  maxNumberOfProblems: 1000,
  hints: { showInferredTypes: true },
  nushellExecutablePath: "nu",
  maxNushellInvocationTime: 10000000,
  includeDirs: [],
};
let globalSettings: NushellIDESettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<NushellIDESettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <NushellIDESettings>(
      (change.settings.nushellLanguageServer || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<NushellIDESettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "nushellLanguageServer",
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

function debounce(func: any, wait: number, immediate: boolean) {
  let timeout: any;

  return function executedFunction(this: any, ...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

documents.onDidChangeContent(
  (() => {
    const throttledValidateTextDocument = debounce(
      validateTextDocument,
      500,
      false
    );

    return (change) => {
      throttledValidateTextDocument(change.document);
    };
  })()
);

async function validateTextDocument(
  textDocument: NuTextDocument
): Promise<void> {
  return await durationLogWrapper(
    `validateTextDocument ${textDocument.uri}`,
    async () => {
      if (!hasDiagnosticRelatedInformationCapability) {
        console.error(
          "Trying to validate a document with no diagnostic capability"
        );
        return;
      }

      // In this simple example we get the settings for every validate run.
      const settings = await getDocumentSettings(textDocument.uri);

      // The validator creates diagnostics for all uppercase words length 2 and more
      const text = textDocument.getText();
      const lineBreaks = findLineBreaks(text);

      const stdout = await runCompiler(
        text,
        "--ide-check",
        settings,
        textDocument.uri
      );

      textDocument.nuInlayHints = [];
      const diagnostics: Diagnostic[] = [];

      // FIXME: We use this to deduplicate type hints given by the compiler.
      //        It'd be nicer if it didn't give duplicate hints in the first place.
      const seenTypeHintPositions = new Set();

      const lines = stdout.split("\n").filter((l) => l.length > 0);
      for (const line of lines) {
        connection.console.log("line: " + line);
        try {
          const obj = JSON.parse(line);

          if (obj.type == "diagnostic") {
            let severity: DiagnosticSeverity = DiagnosticSeverity.Error;

            switch (obj.severity) {
              case "Information":
                severity = DiagnosticSeverity.Information;
                break;
              case "Hint":
                severity = DiagnosticSeverity.Hint;
                break;
              case "Warning":
                severity = DiagnosticSeverity.Warning;
                break;
              case "Error":
                severity = DiagnosticSeverity.Error;
                break;
            }

            const position_start = convertSpan(obj.span.start, lineBreaks);
            const position_end = convertSpan(obj.span.end, lineBreaks);

            const diagnostic: Diagnostic = {
              severity,
              range: {
                start: position_start,
                end: position_end,
              },
              message: obj.message,
              source: textDocument.uri,
            };

            // connection.console.log(diagnostic.message);

            diagnostics.push(diagnostic);
          } else if (obj.type == "hint" && settings.hints.showInferredTypes) {
            if (!seenTypeHintPositions.has(obj.position)) {
              seenTypeHintPositions.add(obj.position);
              const position = convertSpan(obj.position.end, lineBreaks);
              const hint_string = ": " + obj.typename;
              const hint = InlayHint.create(
                position,
                [InlayHintLabelPart.create(hint_string)],
                InlayHintKind.Type
              );

              textDocument.nuInlayHints.push(hint);
            }
          }
        } catch (e) {
          connection.console.error(`error: ${e}`);
        }
      }

      // Send the computed diagnostics to VSCode.
      connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
  );
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an file change event");
});

function lowerBoundBinarySearch(arr: number[], num: number): number {
  let low = 0;
  let mid = 0;
  let high = arr.length - 1;

  if (num >= arr[high]) return high;

  while (low < high) {
    // Bitshift to avoid floating point division
    mid = (low + high) >> 1;

    if (arr[mid] < num) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low - 1;
}

function convertSpan(utf8_offset: number, lineBreaks: Array<number>): Position {
  const lineBreakIndex = lowerBoundBinarySearch(lineBreaks, utf8_offset);

  const start_of_line_offset =
    lineBreakIndex == -1 ? 0 : lineBreaks[lineBreakIndex] + 1;
  const character = Math.max(0, utf8_offset - start_of_line_offset);

  return { line: lineBreakIndex + 1, character };
}

function convertPosition(position: Position, text: string): number {
  let line = 0;
  let character = 0;
  const buffer = new TextEncoder().encode(text);

  let i = 0;
  while (i < buffer.length) {
    if (line == position.line && character == position.character) {
      return i;
    }

    if (buffer.at(i) == 0x0a) {
      line++;
      character = 0;
    } else {
      character++;
    }

    i++;
  }

  return i;
}

async function runCompiler(
  text: string, // this is the script or the snippet of nushell code
  flags: string,
  settings: NushellIDESettings,
  uri: string,
  options: { allowErrors?: boolean } = {}
): Promise<string> {
  const allowErrors =
    options.allowErrors === undefined ? true : options.allowErrors;

  try {
    fs.writeFileSync(tmpFile.name, text);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // connection.console.log(e);
  }

  let stdout = "";
  try {
    const script_path_flag =
      includeFlagForPath(uri) + ":" + settings.includeDirs.join(":") + '"';
    const max_errors = settings.maxNumberOfProblems;

    if (flags.includes("ide-check")) {
      flags = flags + " " + max_errors;
    }

    connection.console.log(
      "running: " +
        `${settings.nushellExecutablePath} ${flags} ${script_path_flag} ${tmpFile.name}`
    );

    const output = await exec(
      `${settings.nushellExecutablePath} ${flags} ${script_path_flag} ${tmpFile.name}`,
      {
        timeout: settings.maxNushellInvocationTime,
      }
    );
    stdout = output.stdout;
    console.log("stdout: " + stdout);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    stdout = e.stdout;
    if (!allowErrors) {
      if (e.signal != null) {
        connection.console.log("compile failed: ");
        connection.console.log(e);
      } else {
        connection.console.log("Error:" + e);
      }
      throw e;
    }
  }

  return stdout;
}

connection.onHover(async (request: HoverParams) => {
  return await durationLogWrapper(`onHover`, async () => {
    const document = documents.get(request.textDocument.uri);
    const settings = await getDocumentSettings(request.textDocument.uri);

    const text = document?.getText();

    if (!(typeof text == "string")) return null;

    // connection.console.log("request: ");
    // connection.console.log(request.textDocument.uri);
    // connection.console.log("index: " + convertPosition(request.position, text));
    const stdout = await runCompiler(
      text,
      "--ide-hover " + convertPosition(request.position, text),
      settings,
      request.textDocument.uri
    );

    const lines = stdout.split("\n").filter((l) => l.length > 0);
    for (const line of lines) {
      const obj = JSON.parse(line);
      // connection.console.log("hovering");
      // connection.console.log(obj);

      // FIXME: Figure out how to import `vscode` package in server.ts without
      // getting runtime import errors to remove this deprecation warning.
      const contents = {
        value: obj.hover,
        language: "nushell",
      };

      if (obj.hover != "") {
        if (obj.span) {
          const lineBreaks = findLineBreaks(
            obj.file
              ? (await fs.promises.readFile(obj.file)).toString()
              : document?.getText() ?? ""
          );

          return {
            contents,
            range: {
              start: convertSpan(obj.span.start, lineBreaks),
              end: convertSpan(obj.span.end, lineBreaks),
            },
          };
        } else {
          return { contents };
        }
      }
    }
  });
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  async (request: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    return await durationLogWrapper(`onCompletion`, async () => {
      // The pass parameter contains the position of the text document in
      // which code complete got requested. For the example we ignore this
      // info and always provide the same completion items.

      const document = documents.get(request.textDocument.uri);
      const settings = await getDocumentSettings(request.textDocument.uri);

      const text = document?.getText();

      if (typeof text == "string") {
        // connection.console.log("completion request: ");
        // connection.console.log(request.textDocument.uri);
        const index = convertPosition(request.position, text);
        // connection.console.log("index: " + index);
        const stdout = await runCompiler(
          text,
          "--ide-complete " + index,
          settings,
          request.textDocument.uri
        );
        // connection.console.log("got: " + stdout);

        const lines = stdout.split("\n").filter((l) => l.length > 0);
        for (const line of lines) {
          const obj = JSON.parse(line);
          // connection.console.log("completions");
          // connection.console.log(obj);

          const output = [];
          let index = 1;
          for (const completion of obj.completions) {
            output.push({
              label: completion,
              kind: completion.includes("(")
                ? CompletionItemKind.Function
                : CompletionItemKind.Field,
              data: index,
            });
            index++;
          }
          return output;
        }
      }

      return [];
    });
  }
);

connection.onDefinition(async (request) => {
  return await durationLogWrapper(`onDefinition`, async () => {
    const document = documents.get(request.textDocument.uri);
    if (!document) return;
    const settings = await getDocumentSettings(request.textDocument.uri);

    const text = document.getText();

    // connection.console.log("request: ");
    // connection.console.log(request.textDocument.uri);
    // connection.console.log("index: " + convertPosition(request.position, text));
    const stdout = await runCompiler(
      text,
      "--ide-goto-def " + convertPosition(request.position, text),
      settings,
      request.textDocument.uri
    );
    return goToDefinition(document, stdout);
  });
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return item;
});

async function goToDefinition(
  document: NuTextDocument,
  nushellOutput: string
): Promise<HandlerResult<Definition, void> | undefined> {
  const lines = nushellOutput.split("\n").filter((l) => l.length > 0);
  for (const line of lines) {
    const obj = JSON.parse(line);
    // connection.console.log("going to type definition");
    // connection.console.log(obj);
    if (obj.file === "" || obj.file === "__prelude__") return;

    const lineBreaks = findLineBreaks(
      obj.file
        ? (await fs.promises.readFile(obj.file)).toString()
        : document.getText() ?? ""
    );

    let uri = "";
    if (obj.file == tmpFile.name) {
      uri = document.uri;
    } else {
      uri = obj.file ? "file://" + obj.file : document.uri;
    }

    // connection.console.log(uri);

    return {
      uri: uri,
      range: {
        start: convertSpan(obj.start, lineBreaks),
        end: convertSpan(obj.end, lineBreaks),
      },
    };
  }
}

connection.languages.inlayHint.on((params: InlayHintParams) => {
  const document = documents.get(params.textDocument.uri) as NuTextDocument;
  return document.nuInlayHints;
});

function findLineBreaks(utf16_text: string): Array<number> {
  const utf8_text = new TextEncoder().encode(utf16_text);
  const lineBreaks: Array<number> = [];

  for (let i = 0; i < utf8_text.length; ++i) {
    if (utf8_text[i] == 0x0a) {
      lineBreaks.push(i);
    }
  }

  return lineBreaks;
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

const tokenBuilders: Map<string, SemanticTokensBuilder> = new Map();
documents.onDidClose((event) => {
  connection.console.log("documents.OnDidClose");
  tokenBuilders.delete(event.document.uri);
});

function getTokenBuilder(document: NuTextDocument): SemanticTokensBuilder {
  connection.console.log("getTokenBuilder");

  let result = tokenBuilders.get(document.uri);
  if (result !== undefined) {
    return result;
  }
  result = new SemanticTokensBuilder();
  connection.console.log("SemanticTokensBuilder " + JSON.stringify(result));
  tokenBuilders.set(document.uri, result);
  return result;
}

async function buildTokens(
  builder: SemanticTokensBuilder,
  textDocument: NuTextDocument
) {
  const settings = await getDocumentSettings(textDocument.uri);
  const text = textDocument.getText();
  const lineBreaks = findLineBreaks(text);
  const stdout = await runCompiler(
    text,
    "--ide-ast",
    settings,
    textDocument.uri
  );
  const lines = stdout.split("\n").filter((l) => l.length > 0);
  for (const line of lines) {
    // connection.console.log("ast_line: " + line);
    try {
      const obj = JSON.parse(line);
      // connection.console.log("json_obj: " + JSON.stringify(obj));
      // connection.console.log("stringify obj[0]: " + JSON.stringify(obj[0]));
      for (const node of obj) {
        if (node.type === "ast") {
          connection.console.log("node: " + JSON.stringify(node));
          // connection.console.log("node.type: " + node.type);
          // connection.console.log("node.shape: " + node.shape);
          // connection.console.log(
          //   "node.span.start: " +
          //     node.span.start +
          //     " node.span.end: " +
          //     node.span.end +
          //     " linebreaks: " +
          //     lineBreaks
          // );
          const position_start = convertSpan(node.span.start, lineBreaks);
          const position_end = convertSpan(node.span.end, lineBreaks);
          const tokenType = Number(TokenTypes[node.shape]);
          const tokenModifiers = Number(TokenModifiers[node.modifiers]);
          connection.console.log(
            "line#: " +
              position_start.line +
              " character#: " +
              position_start.character +
              " length: " +
              (position_end.character - position_start.character) +
              " tokenType: " +
              tokenType +
              " tokenType shape: " +
              node.shape +
              " name: " +
              TokenTypes[node.shape] +
              " tokenModifiers: " +
              tokenModifiers
          );
          builder.push(
            position_start.line,
            position_start.character,
            position_end.character - position_start.character,
            tokenType,
            tokenModifiers
          );
        }
      }
    } catch (e) {
      connection.console.log("error: " + e);
    }
  }

  // const regexp = /\w+/g;
  // let match: RegExpMatchArray;
  // let tokenCounter = 0;
  // let modifierCounter = 0;
  // while ((match = regexp.exec(text)) !== null) {
  //   const word = match[0];
  //   const position = document.positionAt(match.index);
  //   const tokenType = tokenCounter % TokenTypes._;
  //   const tokenModifier = 1 << modifierCounter % TokenModifiers._;
  //   connection.console.log(
  //     "word " +
  //       word +
  //       " position " +
  //       JSON.stringify(position) +
  //       " tokenType " +
  //       tokenType +
  //       " (" +
  //       TokenTypes[tokenType] +
  //       ") " +
  //       " tokenModifier " +
  //       tokenModifier +
  //       " (" +
  //       TokenModifiers[tokenModifier] +
  //       ") " +
  //       " tokenCounter " +
  //       tokenCounter +
  //       " modifierCounter " +
  //       modifierCounter
  //   );
  //   builder.push(
  //     position.line,
  //     position.character,
  //     word.length,
  //     tokenType,
  //     tokenModifier
  //   );
  //   tokenCounter++;
  //   modifierCounter++;
  // }
}

connection.languages.semanticTokens.on((params) => {
  connection.console.log("semanticTokens.on " + JSON.stringify(params));

  const document = documents.get(params.textDocument.uri);
  if (document === undefined) {
    connection.console.log("semanticTokens.on undefined");
    return { data: [] };
  }
  const builder = getTokenBuilder(document);
  buildTokens(builder, document);
  connection.console.log(
    "semanticTokens.on buildTokens " + JSON.stringify(builder)
  );
  return builder.build();
});

connection.languages.semanticTokens.onDelta((params) => {
  connection.console.log("semanticTokens.onRange " + JSON.stringify(params));

  const document = documents.get(params.textDocument.uri);
  if (document === undefined) {
    return { edits: [] };
  }
  const builder = getTokenBuilder(document);
  builder.previousResult(params.previousResultId);
  buildTokens(builder, document);
  return builder.buildEdits();
});

connection.languages.semanticTokens.onRange((params) => {
  connection.console.log("semanticTokens.onRange " + JSON.stringify(params));

  return { data: [] };
});
