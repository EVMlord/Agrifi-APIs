const express = require('express');
const bodyParser = require('body-parser');
const ethers = require('ethers');
require('dotenv').config();

const contractABI = require('./contractABI.json');
const contractAddress = '0x31b3d2B6f4eac5828e6149934232Ac8167A0B561';

const key = process.env.PRIVATE_KEY;
const prov = process.env.RPC_URL;
// const owner = process.env.FROM_ADDRESS;

// Set up the provider
const provider = new ethers.JsonRpcProvider(String(prov));

// Create a wallet and signer instance
const wallet = new ethers.Wallet(String(key), String(prov));
const signer = wallet.connect(provider);

const app = express();
app.use(bodyParser.json());

const contract = new ethers.Contract(contractAddress, contractABI, signer);

// // Middleware for API key verification
// app.use((req, res, next) => {
//     const apiKey = req.get('X-API-Key'); // Or you can get it from req.headers['x-api-key']
//     if (!apiKey || apiKey !== process.env.API_KEY) {
//         return res.status(401).json({ success: false, message: 'Unauthorized' });
//     }
//     next(); // If the API key is valid, proceed to the endpoint
// });

// API key verification middleware
const verifyApiKey = (req, res, next) => {
    const apiKey = req.get('X-API-Key'); // Or req.headers['x-api-key']
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next(); // If the API key is valid, continue
};

// REST API endpoint to setup a farmer
app.post('/setupFarmer', verifyApiKey, async (req, res) => {
    const { wallet, name, start, bioData, cropData, farmData } = req.body;

    // The address that will be used to send this transaction
    const fromAddress = process.env.FROM_ADDRESS;

    // Send transaction to the smart contract
    try {
        const setupFarmerTx = await contract.setupFarmer(
            wallet,
            name,
            start,
            bioData,
            cropData,
            farmData
        ).send({
            from: fromAddress,
            gas: 1000000, // Set the gas limit for the transaction
            // gasPrice: await web3.eth.getGasPrice() // Fetch the current gas price
        });

        // If the transaction is successful, send back the transaction receipt
        res.json({ success: true, transaction: setupFarmerTx });
    } catch (error) {
        // If there's an error, send back the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/updateBioData', verifyApiKey, async (req, res) => {
    const { wallet, bioData } = req.body;
    try {
        const updateTx = await contract.updateBioData(wallet, bioData).send({
            from: process.env.FROM_ADDRESS,
            gas: 1000000 // Set the gas limit for the transaction
        });
        res.json({ success: true, data: updateTx });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/updateFarmData', verifyApiKey, async (req, res) => {
    const { wallet, farmData } = req.body;
    try {
        const updateTx = await contract.updateFarmData(wallet, farmData).send({
            from: process.env.FROM_ADDRESS,
            gas: 1000000 // Set the gas limit for the transaction
        });
        res.json({ success: true, data: updateTx });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/updateCropData', verifyApiKey, async (req, res) => {
    const { wallet, cropData } = req.body;
    try {
        const updateTx = await contract.updateCropData(wallet, cropData).send({
            from: process.env.FROM_ADDRESS,
            gas: 1000000 // Set the gas limit for the transaction
        });
        res.json({ success: true, data: updateTx });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/farmer/updateNameAndStart', verifyApiKey, async (req, res) => {
    const { walletAddress, newName, newStart } = req.body;

    try {
        // The address that will be used to send this transaction
        const fromAddress = process.env.FROM_ADDRESS;

        // Send transaction to the smart contract
        const updateTx = await contract.updateFamerNameAndStart(walletAddress, newName, newStart).send({
            from: fromAddress,
            gas: 1000000, // Set the gas limit for the transaction
        });

        // Respond with success and the transaction receipt
        res.json({ success: true, transactionReceipt: updateTx });
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/farmer/:wallet', async (req, res) => {
    const walletAddress = req.params.wallet;

    try {
        // Call the function that returns farmer details
        let farmerDetailsArray = await contract.farmers(walletAddress);

        // Convert BigInts to strings
        farmerDetailsArray = JSON.parse(JSON.stringify(farmerDetailsArray, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v));

        const farmerDetails = {
            name: farmerDetailsArray[0],
            wallet: farmerDetailsArray[1],
            start: farmerDetailsArray[2],
            sbtID: farmerDetailsArray[3],
            bioData: {
                stateOfOrigin: farmerDetailsArray[4][0],
                maritalStatus: farmerDetailsArray[4][1],
                religion: farmerDetailsArray[4][2],
                dateOfBirth: farmerDetailsArray[4][3]
            },
            cropData: {
                primary: farmerDetailsArray[5][0],
                secondary: farmerDetailsArray[5][1],
                tetiary: farmerDetailsArray[5][2]
            },
            farmData: {
                farmName: farmerDetailsArray[6][0],
                farmersAssociation: farmerDetailsArray[6][1],
                farmingSeason: farmerDetailsArray[6][2],
                sizeOfFarmInHectares: farmerDetailsArray[6][3],
                averageYieldPerHarvestInMetricTons: farmerDetailsArray[6][4]
            }
        };

        // Respond with the farmer details
        res.json({ success: true, farmerDetails });
    } catch (error) {
        // If there's an error, send back the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});