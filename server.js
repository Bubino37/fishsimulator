const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json()); // Toto umožní, aby telo požiadavky bolo spracované ako JSON

const DATA_FILE = './data.json';

// Endpoint pre aktualizáciu dát
app.post('/update', (req, res) => {
    const newData = req.body;

    // Načítanie a aktualizácia súboru data.json
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }

        // Parse the current data and update it
        let currentData = JSON.parse(data);
        currentData.inventory = newData.inventory || currentData.inventory;
        currentData.level = newData.level || currentData.level;
        currentData.money = newData.money || currentData.money;

        // Write the updated data back to the file
        fs.writeFile(DATA_FILE, JSON.stringify(currentData, null, 2), err => {
            if (err) {
                res.status(500).send('Error writing to data file');
                return;
            }
            res.send({ message: 'Data updated successfully', data: currentData });
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
