import Color from 'color';
import React, { ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';

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
  const [json, setJson] = React.useState<Theme | null>();
  const [colors, setColors] = React.useState<Array<string>>();

  const validate = () => {
    let asJson = null;
    try {
      asJson = JSON.parse(text);
      setJson(asJson);
    } catch (error) {
      alert('Invalid JSON');
      setJson(null);
    }

    if (asJson) {
      colorsFromTheme(asJson);
    }
  };

  const colorsFromTheme = (theme: Theme) => {
    // get all colors from the theme
    // dedupe the colors and sort them (roygbiv)
    const allColors: Array<string> = [];

    // semantic token colors
    Object.values(theme.semanticTokenColors).forEach((color) => {
      allColors.push(Color(color.foreground).hsl().string());
    });

    // token colors
    theme.tokenColors.forEach((token) => {
      allColors.push(Color(token.settings.foreground).hsl().string());
    });

    // colors
    Object.values(theme.colors).forEach((color) => {
      allColors.push(Color(color).hsl().string());
    });

    // dedupe
    const dedupedColors = Array.from(new Set(allColors)).filter(
      (color) => color ?? false
    );

    // sort the colors by their RGB values (msb to lsb)
    const sortedColors = dedupedColors.sort((a, b) => {
      const aRGB = Color(a).rgb().array();
      const bRGB = Color(b).rgb().array();
      const aNum = aRGB[0] * 256 * 256 + aRGB[1] * 256 + aRGB[2];
      const bNum = bRGB[0] * 256 * 256 + bRGB[1] * 256 + bRGB[2];

      return aNum - bNum;
    });

    setColors(sortedColors);
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
                {Color(color).hex()}
              </li>
            ))
          : null}
      </ul>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
