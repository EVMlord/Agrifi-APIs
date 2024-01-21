const express = require('express');
const bodyParser = require('body-parser');
const ethers = require('ethers');
require('dotenv').config();

const PROJECT_NAME = 'Agrifi';
const OTHER_COOL_INFO = 'AgriFi seeks to reimagine how farmers engage with the market and exercise their sovereignty.\n\n Through digitalization and smart contracts on Toronet, agricultural markets can become fairer, more transparent, more connected, and more inclusive.';

const sbtABI = require('./ABIs/sbtABI.json');
const poooolABI = require('./ABIs/FundingPoolABI.json');
const factoryABI = require('./ABIs/PoolFactoryABI.json');
const badgeABI = require('./ABIs/InvestorBadgeABI.json');
// const contractAddress = '0xF039EEa7e5dc44f8979c3198C62B529829F04147';
// const sbtAddress = '0x77f89353d4fA2610710A2089771d028Eab3127a4'; // with logic @ 0x47E14b46a986F027a7E98680b8829A8891b149ce
const sbtAddress = '0x9595c8ce10e87d5D98Cc381F3C3546E54736b3fF'; // with logic @ 0x6CA1b2147dAF94A6604671094737124f9635fcd7
const badgeAddress = "0x3D742c8f100B6912E74f6cC9f2FcC277B4B1D756";
const factoryAddress = "0xe01ac067FF9b2AB48419e6E615f3B4ee2dbF80cd";

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

const contract = new ethers.Contract(sbtAddress, sbtABI, signer);
const badgeContract = new ethers.Contract(badgeAddress, badgeABI, signer);
const factoryontract = new ethers.Contract(factoryAddress, factoryABI, signer);

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

// const verifyFarmer = (req, res, next) => {

// }

// REST API endpoint to setup a farmer
app.post('/setupFarmer', verifyApiKey, async (req, res) => {
    const { wallet, name, start, loanAmount, profileImage, bioData, cropData, farmData } = req.body;

    // Send transaction to the smart contract
    try {
        const setupFarmerTx = await contract.setupFarmer(
            wallet,
            name,
            start,
            loanAmount,
            profileImage,
            bioData,
            cropData,
            farmData
        );

        const result = await setupFarmerTx.wait();
        const reciept = { hash: result.hash, valid: result.status === 1 ? true : false }
        console.log(reciept)

        // If the transaction is successful, send back the transaction receipt
        res.json({ success: true, reciept });
    } catch (error) {
        // If there's an error, send back the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/updateBioData', verifyApiKey, async (req, res) => {
    const { wallet, bioData } = req.body;
    // Call the balanceOf function from the smart contract
    const balance = await contract.balanceOf(wallet);
    if (Number(balance) < 1) {
        res.status(500).json({ success: false, error: "Farmer does not exist!" });
    } else {
        try {
            const updateTx = await contract.updateBioData(wallet, bioData);
            const result = await updateTx.wait();
            const data = { hash: result.hash, valid: result.status === 1 ? true : false }
            res.json({ success: true, data });
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, error: error.message });
        }
    }

});

app.post('/updateFarmData', verifyApiKey, async (req, res) => {
    const { wallet, farmData } = req.body;
    // Call the balanceOf function from the smart contract
    const balance = await contract.balanceOf(wallet);
    if (Number(balance) < 1) {
        res.status(500).json({ success: false, error: "Farmer does not exist!" });
    } else {
        try {
            const updateTx = await contract.updateFarmData(wallet, farmData);
            res.json({ success: true, data: updateTx });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

});

app.post('/updateCropData', verifyApiKey, async (req, res) => {
    const { wallet, cropData } = req.body;
    // Call the balanceOf function from the smart contract
    const balance = await contract.balanceOf(wallet);
    if (Number(balance) < 1) {
        res.status(500).json({ success: false, error: "Farmer does not exist!" });
    } else {
        try {
            const updateTx = await contract.updateCropData(wallet, cropData);
            res.json({ success: true, data: updateTx });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

});

app.post('/updateProfileImage', verifyApiKey, async (req, res) => {
    const { wallet, newImage } = req.body;
    // Call the balanceOf function from the smart contract
    const balance = await contract.balanceOf(wallet);
    if (Number(balance) < 1) {
        res.status(500).json({ success: false, error: "Farmer does not exist!" });
    } else {
        try {
            const updateTx = await contract.updateProfileImage(wallet, newImage);
            res.json({ success: true, data: updateTx });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

});

app.post('/farmer/updateNameAndStart', verifyApiKey, async (req, res) => {
    const { walletAddress, newName, newStart } = req.body;
    // Call the balanceOf function from the smart contract
    const balance = await contract.balanceOf(walletAddress);
    if (Number(balance) < 1) {
        res.status(500).json({ success: false, error: "Farmer does not exist!" });
    } else {
        try {
            // The address that will be used to send this transaction
            // const fromAddress = process.env.FROM_ADDRESS;

            // Send transaction to the smart contract
            const updateTx = await contract.updateFamerNameAndStart(walletAddress, newName, newStart);

            // Respond with success and the transaction receipt
            res.json({ success: true, data: updateTx });
        } catch (error) {
            // If there's an error, respond with the error message
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

app.post('/pool/create', verifyApiKey, async (req, res) => {
    const { name, crop, risk, estimatedYield, cycle } = req.body;

    try {
        // The address that will be used to send this transaction
        // const fromAddress = process.env.FROM_ADDRESS;

        // Send transaction to the smart contract
        const createTx = await factoryontract.createFundingPool(name, crop, risk, estimatedYield, cycle);

        const result = await createTx.wait();
        const reciept = { hash: result.hash, valid: result.status === 1 ? true : false }
        console.log(reciept)

        // If the transaction is successful, send back the transaction receipt
        res.json({ success: true, reciept });

        // // Respond with success and the transaction receipt
        // res.json({ success: true, data: createTx });
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ success: false, message: error.message });
    }
});


app.get('/farmer/:wallet', async (req, res) => {
    const walletAddress = req.params.wallet;

    try {
        // Call the function that returns farmer details
        let farmerDetailsArray = await contract.farmersData(walletAddress);

        console.log(farmerDetailsArray)

        // Convert BigInts to strings
        farmerDetailsArray = JSON.parse(JSON.stringify(farmerDetailsArray, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v));



        const farmerDetails = {
            name: farmerDetailsArray[0],
            wallet: farmerDetailsArray[1],
            // pools: farmerDetailsArray[2],
            pool: farmerDetailsArray[2],
            start: farmerDetailsArray[3],
            sbtID: farmerDetailsArray[4],
            loanAmount: farmerDetailsArray[5],
            isFunded: farmerDetailsArray[6],
            bioData: {
                stateOfOrigin: farmerDetailsArray[7][0],
                maritalStatus: farmerDetailsArray[7][1],
                religion: farmerDetailsArray[7][2],
                dateOfBirth: farmerDetailsArray[7][3]
            },
            cropData: {
                primary: farmerDetailsArray[8][0],
                secondary: farmerDetailsArray[8][1],
                tetiary: farmerDetailsArray[8][2]
            },
            farmData: {
                farmName: farmerDetailsArray[9][0],
                farmersAssociation: farmerDetailsArray[9][1],
                farmingSeason: farmerDetailsArray[9][2],
                sizeOfFarmInHectares: farmerDetailsArray[9][3],
                averageYieldPerHarvestInMetricTons: farmerDetailsArray[9][4]
            }
        };

        // Respond with the farmer details
        res.json({ success: true, farmerDetails });
    } catch (error) {
        console.log(error)
        // If there's an error, send back the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/farmer/tokenId/:walletAddress', async (req, res) => {
    const walletAddress = req.params.walletAddress;

    try {
        // Call the tokenIdOf function from the contract
        const tokenId = await contract.tokenIdOf(walletAddress);

        // Respond with the token ID as a number
        res.json({ success: true, tokenId: ethers.toNumber(tokenId) });
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/balance/:owner', async (req, res) => {
    const ownerAddress = req.params.owner;

    try {
        // Call the balanceOf function from the smart contract
        const balance = await contract.balanceOf(ownerAddress);

        // Respond with the balance as a number
        res.json({ success: true, balance: ethers.toNumber(balance) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/token/:tokenId', async (req, res) => {
    const tokenId = req.params.tokenId;

    try {
        // Call the tokenURI function from the smart contract
        const uri = await contract.tokenURI(tokenId);

        const jsonObject = await parseTokenUri(uri);

        // Respond with the URI
        res.json({ success: true, tokenURI: jsonObject });
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/', async (req, res) => {
    try {
        // Fetch total number of farmers from the blockchain
        const totalFarmers = await contract.totalSupply();

        // Construct the statistics object
        const stats = {
            projectName: PROJECT_NAME,
            totalFarmers: ethers.toNumber(totalFarmers),
            otherCoolInfo: OTHER_COOL_INFO,
            documentation: 'https://documenter.getpostman.com/view/19675514/2s9YeBeZQx'
            // You can add more statistics here
        };

        // Respond with the statistics
        res.json({ success: true, statistics: stats });
    } catch (error) {
        // If there's an error, respond with the error message
        res.status(500).json({ success: false, message: error.message });
    }
});

// UTILS

async function parseTokenUri(uri) {
    let jsonString;

    if (uri.startsWith('ipfs://')) {
        jsonString = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const response = await fetch(jsonString);
        const jsonObject = await response.json();
        return jsonObject;
    } else if (uri.startsWith('data:application/json;base64,')) {
        const base64String = uri.replace("data:application/json;base64,", "");
        jsonString = atob(base64String);
        Buffer.from(base64String, 'base64')
        const jsonObject = JSON.parse(jsonString);
        return jsonObject;
    } else {

        try {

            const response = await fetch(uri);
            const jsonObject = await response.json();
            return jsonObject;


        } catch (err) {
            console.log(uri);
            console.log("Invalid IPFS URI")
            throw new Error('Invalid IPFS URI');

        }
    }
}


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});