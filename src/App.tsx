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

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const asJson = JSON.parse(e.target.value);
      setJson(asJson);
    } catch (error) {
      setText('Invalid JSON');
      setJson(null);
    }
  };

  return (
    <>
      <textarea onChange={onChange} value={text} />
      <ul>
        {colors
          ? colors.map((color, index) => (
              <li key={index}>
                <span style={{ color: color }}>{color}</span>
              </li>
            ))
          : null}
      </ul>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
