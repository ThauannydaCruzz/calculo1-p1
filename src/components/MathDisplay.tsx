import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathDisplayProps {
  content: string;
}

export const MathDisplay = ({ content }: MathDisplayProps) => {
  // Split content into parts with math expressions
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  
  return (
    <div className="text-gray-300 leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math
          const math = part.slice(2, -2);
          return (
            <div key={index} className="my-4 flex justify-center">
              <BlockMath math={math} />
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} />;
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
};
