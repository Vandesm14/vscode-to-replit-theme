import Color from 'color';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { sortFn } from 'color-sorter';

interface Token {
  name?: string;
  scope: string;
  settings: {
    foreground: string;
  };
}

interface Theme {
  name: string;
  type: 'dark' | 'light';
  semanticTokenColors: Record<string, { foreground: string }>;
  tokenColors: Array<Token>;
  colors: Record<string, string>;
}

function App() {
  const [text, setText] = React.useState('');
  const [colors, setColors] = React.useState<Array<string>>();
  const [scopes, setScopes] = React.useState<Map<string, string[]>>(new Map());

  const validate = () => {
    let asJson = null;
    try {
      asJson = JSON.parse(text);
    } catch (error) {
      alert('Invalid JSON');
    }

    if (asJson) {
      colorsFromTheme(asJson);
    }
  };

  const colorsFromTheme = (theme: Theme) => {
    // get all colors from the theme
    // dedupe the colors and sort them (roygbiv)
    const allColors: Array<string> = [];
    const newScopes: Map<string, string[]> = new Map();

    const upsert = (color: string, scope: string) => {
      const existing = newScopes.get(color);
      if (existing) {
        newScopes.set(color, [...existing, scope]);
      } else {
        newScopes.set(color, [scope]);
      }
    };

    // semantic token colors
    Object.entries(theme.semanticTokenColors).forEach(([scope, color]) => {
      allColors.push(Color(color.foreground).hsl().string());
      upsert(Color(color.foreground).hex(), scope);
    });

    // token colors
    theme.tokenColors.forEach((token) => {
      allColors.push(Color(token.settings.foreground).hsl().string());
      upsert(Color(token.settings.foreground).hex(), token.scope);
    });

    // colors
    Object.entries(theme.colors).forEach(([scope, color]) => {
      allColors.push(Color(color).hsl().string());
      upsert(Color(color).hex(), scope);
    });

    // dedupe
    const dedupedColors = Array.from(new Set(allColors)).filter(
      (color) => color ?? false
    );

    // sort the colors by their RGB values (msb to lsb)
    // const sortedColors = dedupedColors.sort((a, b) => {
    //   const aRGB = Color(a).rgb().array();
    //   const bRGB = Color(b).rgb().array();
    //   const aNum = aRGB[0] * 256 * 256 + aRGB[1] * 256 + aRGB[2];
    //   const bNum = bRGB[0] * 256 * 256 + bRGB[1] * 256 + bRGB[2];

    //   return aNum - bNum;
    // });

    const sortedColors = dedupedColors.sort(sortFn);

    setColors(sortedColors);
    setScopes(newScopes);
  };

  const textColorForBg = (bgColor: string) => {
    const color = Color(bgColor);
    const isLight = color.isLight();

    return isLight ? '#000' : '#fff';
  };

  return (
    <>
      <textarea onChange={(e) => setText(e.target.value)} value={text} />
      <button onClick={validate}>Validate</button>
      <ul>
        {colors
          ? colors.map((color, index) => (
              <li
                key={index}
                style={{
                  backgroundColor: color,
                  color: textColorForBg(color),
                  padding: '0.5rem',
                  display: 'block',
                  width: 'max-content',
                }}
              >
                {Color(color).hex()}{' '}
                {scopes.has(Color(color).hex()) ? (
                  <ul>
                    {scopes.get(Color(color).hex())?.map((scope, index) => (
                      <li key={index}>{scope}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))
          : null}
      </ul>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
