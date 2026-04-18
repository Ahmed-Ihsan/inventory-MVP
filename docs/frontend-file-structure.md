# Frontend File Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   └── Table.js
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── Footer.js
│   │   ├── items/
│   │   │   ├── ItemForm.js
│   │   │   ├── ItemList.js
│   │   │   └── ItemCard.js
│   │   ├── stock/
│   │   │   ├── StockForm.js
│   │   │   ├── StockList.js
│   │   │   └── StockTracker.js
│   │   ├── scanning/
│   │   │   ├── Scanner.js
│   │   │   └── ScanResult.js
│   │   └── auth/
│       ├── LoginForm.js
│       └── RegisterForm.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── ItemCatalog.js
│   │   ├── StockTracking.js
│   │   ├── Scanning.js
│   │   └── Login.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useItems.js
│   │   └── useStock.js
│   ├── utils/
│   │   ├── api.js
│   │   └── constants.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── styles/
│       ├── global.css
│       └── theme.js
├── package.json
├── .gitignore
└── Dockerfile
```