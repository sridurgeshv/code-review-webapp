# code-review-webapp

## frontend part :
```bash
cd client
npm install react-router-dom @monaco-editor/react socket.io-client axios tailwindcss
```

### server 
```bash
npm install
npm run start
```

### client
```bash
npm install
npm start
```

Careful

real-time-code-review/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/
│   │   │   ├── Auth/
│   │   │   └── Dashboard/
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── app.js
    ├── package.json
    └── .env



### google auth :
```bash
cd client
npm install @react-oauth/google firebase
```

