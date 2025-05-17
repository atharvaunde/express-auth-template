require('dotenv').config();
const express = require('express');
const { connectDB } = require('./configs/database');

const PORT = process.env.PORT || 3001;
const app = express();

require('./routers/middlewares/global')(app);
require('./routers/index')(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
