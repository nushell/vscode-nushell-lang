import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const keywordsWithSubCommandsProvider = vscode.languages.registerCompletionItemProvider('nushell', {

        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

            // a simple completion item which inserts `Hello World!`
            // const simpleCompletion = new vscode.CompletionItem('Hello World!');

            // a completion item that inserts its text as snippet,
            // the `insertText`-property is a `SnippetString` which will be
            // honored by the editor.
            // const snippetCompletion = new vscode.CompletionItem('Good part of the day');
            // snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
            // snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

            // a completion item that can be accepted by a commit character,
            // the `commitCharacters`-property is set which means that the completion will
            // be inserted and then the character will be typed.
            // const commitCharacterCompletion = new vscode.CompletionItem('console');
            // commitCharacterCompletion.commitCharacters = ['.'];
            // commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

            // a completion item that retriggers IntelliSense when being accepted,
            // the `command`-property is set which the editor will execute after
            // completion has been inserted. Also, the `insertText` is set so that
            // a space is inserted after `new`
            // const commandCompletion = new vscode.CompletionItem('new');
            // commandCompletion.kind = vscode.CompletionItemKind.Keyword;
            // commandCompletion.insertText = 'new ';
            // commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

            const ansiCompletion = new vscode.CompletionItem('ansi');
            ansiCompletion.commitCharacters = [' '];
            ansiCompletion.documentation = new vscode.MarkdownString('Press <kbd>SpaceBar</kbd> to get completions');

            const strCompletion = new vscode.CompletionItem('str');
            strCompletion.commitCharacters = [' '];
            strCompletion.documentation = new vscode.MarkdownString('Press <kbd>SpaceBar</kbd> to get completions');

            // return all completion items as array
            return [
                // simpleCompletion,
                // snippetCompletion,
                // commitCharacterCompletion,
                // commandCompletion,
                ansiCompletion,
                strCompletion
            ];
        }
    });

    const ansiSubCommandsProvider = vscode.languages.registerCompletionItemProvider(
        'nushell',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

                // get all text until the `position` and check if it reads `console.`
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                if (linePrefix.endsWith('ansi ')) {

                    const ansiStrip = new vscode.CompletionItem('strip', vscode.CompletionItemKind.Method);
                    ansiStrip.documentation = new vscode.MarkdownString('Press `Enter` for a strip');
                    ansiStrip.detail = 'Remove ansi escape sequences';

                    return [
                        ansiStrip
                    ];
                } else {
                    return undefined
                }
            }
        },
        ' ' // triggered whenever a ' ' is being typed
    );

    const strSubCommandsProvider = vscode.languages.registerCompletionItemProvider(
        'nushell',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

                // get all text until the `position` and check if it reads `console.`
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                if (linePrefix.endsWith('str ')) {

                    const strCamelCase = new vscode.CompletionItem('camel-case', vscode.CompletionItemKind.Method);
                    strCamelCase.documentation = new vscode.MarkdownString('Press `Enter` for a camel');
                    strCamelCase.detail = 'Change string to camelCase';

                    const strCapitalize = new vscode.CompletionItem('capitalize', vscode.CompletionItemKind.Method);
                    strCapitalize.documentation = new vscode.MarkdownString('Press `Enter` to capitalize');
                    strCapitalize.detail = 'Capitalize string';

                    const strCollect = new vscode.CompletionItem('collect', vscode.CompletionItemKind.Method);
                    strCollect.documentation = new vscode.MarkdownString('Press `Enter` for a collect');
                    strCollect.detail = 'Collect strings with optional delimiter';

                    const strContains = new vscode.CompletionItem('contains', vscode.CompletionItemKind.Method);
                    strContains.documentation = new vscode.MarkdownString('Press `Enter` for a contains');
                    strContains.detail = 'Check if string contains another string';

                    const strDowncase = new vscode.CompletionItem('downcase', vscode.CompletionItemKind.Method);
                    strDowncase.documentation = new vscode.MarkdownString('Press `Enter` for a downcase');
                    strDowncase.detail = 'Change string to lowercase';

                    const strEndsWith = new vscode.CompletionItem('ends-with', vscode.CompletionItemKind.Method);
                    strEndsWith.documentation = new vscode.MarkdownString('Press `Enter` for a ends-with');
                    strEndsWith.detail = 'Check if string ends with another string';

                    const strFindReplace = new vscode.CompletionItem('find-replace', vscode.CompletionItemKind.Method);
                    strFindReplace.documentation = new vscode.MarkdownString('Press `Enter` for a find-replace');
                    strFindReplace.detail = 'Find string and replace with another';

                    const strFrom = new vscode.CompletionItem('from', vscode.CompletionItemKind.Method);
                    strFrom.documentation = new vscode.MarkdownString('Press `Enter` for a from');
                    strFrom.detail = 'Convert anything to string';

                    const strIndexOf = new vscode.CompletionItem('index-of', vscode.CompletionItemKind.Method);
                    strIndexOf.documentation = new vscode.MarkdownString('Press `Enter` for a index-of');
                    strIndexOf.detail = 'Return the index of a string';

                    const strKebabCase = new vscode.CompletionItem('kebab-case', vscode.CompletionItemKind.Method);
                    strKebabCase.documentation = new vscode.MarkdownString('Press `Enter` for a kebab-case');
                    strKebabCase.detail = 'Change string-to-kebab-case';

                    const strLength = new vscode.CompletionItem('length', vscode.CompletionItemKind.Method);
                    strLength.documentation = new vscode.MarkdownString('Press `Enter` for a length');
                    strLength.detail = 'Return the length of a string in chars';

                    const strLPad = new vscode.CompletionItem('lpad', vscode.CompletionItemKind.Method);
                    strLPad.documentation = new vscode.MarkdownString('Press `Enter` for a lpad');
                    strLPad.detail = 'Left pad a string with another string';

                    const strLTrim = new vscode.CompletionItem('ltrim', vscode.CompletionItemKind.Method);
                    strLTrim.documentation = new vscode.MarkdownString('Press `Enter` for a ltrim');
                    strLTrim.detail = 'Left trim a string with another string';

                    const strPascalCase = new vscode.CompletionItem('pascal-case', vscode.CompletionItemKind.Method);
                    strPascalCase.documentation = new vscode.MarkdownString('Press `Enter` for a pascal-case');
                    strPascalCase.detail = 'Convert StringToPascalCase';

                    const strSnakeCase = new vscode.CompletionItem('snake-case', vscode.CompletionItemKind.Method);
                    strSnakeCase.documentation = new vscode.MarkdownString('Press `Enter` for a snake-case');
                    strSnakeCase.detail = 'Convert string_to_snake_case';

                    const strStartsWith = new vscode.CompletionItem('starts-with', vscode.CompletionItemKind.Method);
                    strStartsWith.documentation = new vscode.MarkdownString('Press `Enter` for a starts-with');
                    strStartsWith.detail = 'Check if a string starts with another string';

                    const strSubString = new vscode.CompletionItem('substring', vscode.CompletionItemKind.Method);
                    strSubString.documentation = new vscode.MarkdownString('Press `Enter` for a substring');
                    strSubString.detail = 'Extract a part of a string';

                    const strToDateTime = new vscode.CompletionItem('to-datetime', vscode.CompletionItemKind.Method);
                    strToDateTime.documentation = new vscode.MarkdownString('Press `Enter` for a to-datetime');
                    strToDateTime.detail = 'Convert a string to a datetime';

                    const strToDecimal = new vscode.CompletionItem('to-decimal', vscode.CompletionItemKind.Method);
                    strToDecimal.documentation = new vscode.MarkdownString('Press `Enter` for a to-decimal');
                    strToDecimal.detail = 'Convert a string to a decimal';

                    const strToInt = new vscode.CompletionItem('to-int', vscode.CompletionItemKind.Method);
                    strToInt.documentation = new vscode.MarkdownString('Press `Enter` for a to-int');
                    strToInt.detail = 'Convert a string to an int';

                    const strTrim = new vscode.CompletionItem('trim', vscode.CompletionItemKind.Method);
                    strTrim.documentation = new vscode.MarkdownString('Press `Enter` for a trim');
                    strTrim.detail = 'Trim a string on both ends';

                    const strUpcase = new vscode.CompletionItem('upcase', vscode.CompletionItemKind.Method);
                    strUpcase.documentation = new vscode.MarkdownString('Press `Enter` for a upcase');
                    strUpcase.detail = 'Change string to upper case';

                    return [
                        strCamelCase,
                        strCapitalize,
                        strCollect,
                        strContains,
                        strDowncase,
                        strEndsWith,
                        strFindReplace,
                        strFrom,
                        strIndexOf,
                        strKebabCase,
                        strLength,
                        strLPad,
                        strLTrim,
                        strPascalCase,
                        strSnakeCase,
                        strStartsWith,
                        strSubString,
                        strToDateTime,
                        strToDecimal,
                        strToInt,
                        strTrim,
                        strUpcase,
                    ];
                } else {
                    return undefined
                }
            }
        },
        ' ' // triggered whenever a ' ' is being typed
    );

    context.subscriptions.push(
        keywordsWithSubCommandsProvider,
        ansiSubCommandsProvider,
        strSubCommandsProvider);
}