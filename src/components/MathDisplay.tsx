import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathDisplayProps {
  content: string;
}

export const MathDisplay = ({ content }: MathDisplayProps) => {
  // Check if content contains markdown tables
  const hasTable = content.includes('|');
  
  if (hasTable) {
    // Split by lines and process tables
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentText = '';
    let inTable = false;
    let tableLines: string[] = [];
    
    lines.forEach((line, idx) => {
      if (line.trim().startsWith('|')) {
        if (!inTable) {
          // Flush any pending text
          if (currentText) {
            elements.push(
              <div key={`text-${idx}`} className="mb-4">
                <MathText content={currentText} />
              </div>
            );
            currentText = '';
          }
          inTable = true;
        }
        tableLines.push(line);
      } else {
        if (inTable) {
          // End of table, render it
          elements.push(
            <div key={`table-${idx}`} className="my-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-700">
                <tbody>
                  {tableLines.map((tLine, tIdx) => {
                    const cells = tLine.split('|').filter(c => c.trim());
                    const isHeader = tIdx === 0;
                    const isSeparator = tLine.includes('---');
                    
                    if (isSeparator) return null;
                    
                    return (
                      <tr key={tIdx} className={isHeader ? 'bg-gray-800' : ''}>
                        {cells.map((cell, cIdx) => {
                          const Tag = isHeader ? 'th' : 'td';
                          return (
                            <Tag
                              key={cIdx}
                              className="border border-gray-700 px-4 py-2 text-left"
                            >
                              <MathText content={cell.trim()} />
                            </Tag>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          tableLines = [];
          inTable = false;
        }
        currentText += (currentText ? '\n' : '') + line;
      }
    });
    
    // Flush remaining content
    if (inTable && tableLines.length > 0) {
      elements.push(
        <div key="table-final" className="my-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <tbody>
              {tableLines.map((tLine, tIdx) => {
                const cells = tLine.split('|').filter(c => c.trim());
                const isHeader = tIdx === 0;
                const isSeparator = tLine.includes('---');
                
                if (isSeparator) return null;
                
                return (
                  <tr key={tIdx} className={isHeader ? 'bg-gray-800' : ''}>
                    {cells.map((cell, cIdx) => {
                      const Tag = isHeader ? 'th' : 'td';
                      return (
                        <Tag
                          key={cIdx}
                          className="border border-gray-700 px-4 py-2 text-left"
                        >
                          <MathText content={cell.trim()} />
                        </Tag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (currentText) {
      elements.push(
        <div key="text-final">
          <MathText content={currentText} />
        </div>
      );
    }
    
    return <div className="text-gray-300 leading-relaxed">{elements}</div>;
  }
  
  return (
    <div className="text-gray-300 leading-relaxed">
      <MathText content={content} />
    </div>
  );
};

const MathText = ({ content }: { content: string }) => {
  // Split content into parts with math expressions
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math
          const math = part.slice(2, -2);
          return (
            <div key={index} className="my-3 flex justify-center">
              <BlockMath math={math} />
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} />;
        } else {
          // Regular text - preserve line breaks
          return <span key={index} className="whitespace-pre-wrap">{part}</span>;
        }
      })}
    </>
  );
};
