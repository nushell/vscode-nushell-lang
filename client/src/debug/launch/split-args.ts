/**
 * Split a command line into arguments, honoring single and double quotes.
 * Quotes group anywhere in a token (`--name="a b"` is one argument) and are
 * dropped from the result.
 *
 * Inside double quotes, backslashes before a `"` follow the Windows
 * command-line rule: each pair is one backslash, and an odd one out makes the
 * `"` a literal quote (`"say \"hi\""` is `say "hi"`). Backslashes before
 * anything else stay as typed, so `"C:\Program Files\x"` keeps working.
 */
export function splitArgs(line: string): string[] {
  const args: string[] = [];
  let current = '';
  let inToken = false; // tells `""` (an empty argument) apart from no argument
  let quote: string | undefined;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote === '"' && char === '\\') {
      let end = i;
      while (line[end] === '\\') {
        end++;
      }
      const count = end - i;
      if (line[end] === '"') {
        current += '\\'.repeat(Math.floor(count / 2));
        if (count % 2 === 1) {
          current += '"'; // escaped: the quote stays open
          i = end;
        } else {
          i = end - 1; // the `"` closes the quote on the next pass
        }
      } else {
        current += '\\'.repeat(count);
        i = end - 1;
      }
    } else if (quote) {
      if (char === quote) {
        quote = undefined;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      inToken = true;
    } else if (/\s/.test(char)) {
      if (inToken) {
        args.push(current);
        current = '';
        inToken = false;
      }
    } else {
      current += char;
      inToken = true;
    }
  }

  if (inToken) {
    args.push(current); // an unclosed quote runs to the end of the line
  }

  return args;
}
