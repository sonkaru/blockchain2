// Web3实例
let web3;
let contract;
const contractAddress = "你的智能合约地址";  // 部署合约的地址
const contractABI = [/* 你的合约 ABI，这可以通过 Truffle 获取 */];

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Connected to contract");
        loadModels();
    } else {
        alert("请安装 MetaMask!");
    }
}

init();

// 列出模型
document.getElementById('listModelForm').onsubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const name = document.getElementById('modelName').value;
    const description = document.getElementById('modelDescription').value;
    const price = web3.utils.toWei(document.getElementById('modelPrice').value, 'ether');

    await contract.methods.listModel(name, description, price).send({ from: accounts[0] });
    loadModels();
};

// 加载模型
async function loadModels() {
    const modelCount = await contract.methods.modelCount().call();
    const modelsList = document.getElementById('modelsList');
    modelsList.innerHTML = '';

    for (let i = 1; i <= modelCount; i++) {
        const model = await contract.methods.getModelDetails(i).call();
        const modelHTML = `
      <div>
        <h3>Model ID: ${i}</h3>
        <p>Name: ${model[0]}</p>
        <p>Description: ${model[1]}</p>
        <p>Price: ${web3.utils.fromWei(model[2], 'ether')} ETH</p>
        <p>Creator: ${model[3]}</p>
        <p>Rating: ${model[4]}</p>
      </div>
    `;
        modelsList.innerHTML += modelHTML;
    }
}

// 购买模型
document.getElementById('purchaseModelForm').onsubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const modelId = document.getElementById('modelIdToPurchase').value;
    const model = await contract.methods.getModelDetails(modelId).call();
    await contract.methods.purchaseModel(modelId).send({ from: accounts[0], value: model[2] });
};

// 评价模型
document.getElementById('rateModelForm').onsubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const modelId = document.getElementById('modelIdToRate').value;
    const rating = document.getElementById('modelRating').value;
    await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
};

// 提现资金
document.getElementById('withdrawButton').onclick = async () => {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.withdrawFunds().send({ from: accounts[0] });
};
