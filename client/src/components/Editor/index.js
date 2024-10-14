import React, { forwardRef, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import { Save } from 'lucide-react';
import './index.css';

const Editor = forwardRef(({ user, selectedTemplate = 'javascript', onCodeChange, onSave }, ref) => {
  const { id: roomId } = useParams();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [version, setVersion] = useState(0);
  const [localCode, setLocalCode] = useState('');
  const [isApplyingChange, setIsApplyingChange] = useState(false);

  useEffect(() => {
    if (!user?.displayName) return;

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    setSocket(newSocket);

    newSocket.emit('join-room', {
      roomId,
      user,
      template: selectedTemplate
    });

    newSocket.on('init-room', ({ code, version: serverVersion, template }) => {
      if (ref.current) {
        ref.current.setValue(code || getDefaultCode(template));
        setLocalCode(code || getDefaultCode(template));
        setVersion(serverVersion);
      }
    });

    newSocket.on('code-update', ({ code, version: newVersion, userId }) => {
      console.log('Received code update from:', userId);
      if (ref.current) {
        setIsApplyingChange(true);
        ref.current.setValue(code);
        setLocalCode(code);
        setVersion(newVersion);
        setIsApplyingChange(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user, selectedTemplate]);
 
  const getLanguage = () => {
    switch(selectedTemplate) {
      case 'Python': return 'python';
      case 'Node.js': return 'javascript';
      case 'C': return 'c';
      case 'C++': return 'cpp';
      case 'Java': return 'java';
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

  const handleEditorChange = (value) => {
    if (isApplyingChange) return;
    setLocalCode(value);
    if (onCodeChange) onCodeChange(value);
  };

  const handleSave = () => {
    if (!socket) return;
    
    const newVersion = version + 1;
    setVersion(newVersion);

    const projectDetails = {
      id: roomId,
      title: location.state?.projectTitle || 'Untitled Project',
      language: selectedTemplate,
      lastEdited: new Date().toISOString()
    };
    
    socket.emit('code-save', {
      roomId,
      code: localCode,
      version: newVersion,
      userId: socket.id,
      projectDetails
    });
    
    if (onSave) onSave(localCode, projectDetails);

     // Save to localStorage
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const existingProjectIndex = savedProjects.findIndex(p => p.id === projectDetails.id);
    if (existingProjectIndex !== -1) {
      savedProjects[existingProjectIndex] = projectDetails;
    } else {
      savedProjects.push(projectDetails);
    }
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
  };

  return (
    <div className="h-screen">
      <div className="editor-toolbar">
        <button onClick={handleSave} className="save-button">
          <Save size={16} className="icon" />
          <span className="save-text">Save</span>
      </button>
      </div>
      <MonacoEditor
        height="90vh"
        defaultLanguage={getLanguage(selectedTemplate)}
        defaultValue={getDefaultCode(selectedTemplate)}
        theme="vs-dark"
        onChange={handleEditorChange}
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