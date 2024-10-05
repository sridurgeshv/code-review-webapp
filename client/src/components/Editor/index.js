import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import './index.css';

function Editor() {
  return (
    <div className="h-screen">
      <MonacoEditor
        height="90vh"
        defaultLanguage="javascript"
        theme="vs-dark"
        value="// Start coding here..."
        onChange={(value) => {
          console.log(value);
        }}
      />
    </div>
  );
}

export default Editor;