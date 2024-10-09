import React, { forwardRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './index.css';

const Editor = forwardRef(({ selectedTemplate = 'javascript', onCodeChange }, ref) => {
  const getLanguage = () => {
    switch(selectedTemplate) {
      case 'Python': return 'python';
      case 'Node.js': return 'javascript';
      case 'C': return 'c';
      case 'C++': return 'cpp';
      case 'Java': return 'java';
      case 'HTML, CSS, JS': return 'javascript';
      case 'React': return 'javascript';
      default: return 'javascript';
    }
  };

  const getDefaultCode = () => {
    switch(selectedTemplate) {
      case 'Python': 
        return 'print("Hello World")';
      case 'Node.js': 
        return 'console.log("Hello World");';
      case 'C': 
        return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
      case 'C++': 
        return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
      case 'Java': 
        return 'public class Program {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}';
      default:
        return '// Start coding here...';
    }
  };

  return (
    <div className="h-screen">
      <MonacoEditor
        height="90vh"
        defaultLanguage={getLanguage()}
        defaultValue={getDefaultCode()}
        theme="vs-dark"
        onChange={onCodeChange}
        onMount={(editor) => {
          if (ref) {
            ref.current = editor;
          }
        }}
      />
    </div>
  );
});

export default Editor;