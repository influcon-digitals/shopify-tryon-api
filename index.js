const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/tryon', (req, res) => {
    res.send('Shopify Try-On API is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});