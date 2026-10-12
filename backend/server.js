const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express backend!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
