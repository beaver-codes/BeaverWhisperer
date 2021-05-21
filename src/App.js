import { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import BeaverWhisperer from './BeaverWhisperer.json';

const INFURA_ENDPOINT = '<Use your INFURA URL here>';
const CONTRACT_ADDRESS = '0x867e3fD1cB5a7B9638E3Cdb731E8172aC3D2d417';

function App() {
  const [beaverSays, setBeaverSays] = useState('');
  const [owner, setOwner] = useState('');
  const [lastPrice, setLastPrice] = useState(0);


  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState(0);
  const [newBeaverSays, setNewBeaverSays] = useState('');

  const [changeCounter, setChangeCounter] = useState(0);

  useEffect(() => {
    const web3 = new Web3(INFURA_ENDPOINT);

    const contract = new web3.eth.Contract(BeaverWhisperer.abi, CONTRACT_ADDRESS);

    contract.methods.beaverSays().call()
      .then(setBeaverSays)
    contract.methods.owner().call()
      .then(setOwner)
    contract.methods.lastSaleAmount().call()
      .then((_lastPrice) => {
        setLastPrice(_lastPrice);
        setPrice(_lastPrice + 1)
      })
  }, [changeCounter])


  useEffect(() => {
    if (Web3.givenProvider) {
      const web3 = new Web3(Web3.givenProvider);

      web3.eth.getAccounts().then(setAccounts);
    }
  }, [])


  const handleConnect = () => {
    Web3.givenProvider.send('eth_requestAccounts')
      .then(response => setAccounts(response.result));
  }

  const handleBuy = e => {
    e.preventDefault();
    const web3 = new Web3(Web3.givenProvider);
    const contract = new web3.eth.Contract(BeaverWhisperer.abi, CONTRACT_ADDRESS);

    contract.methods.buy()
      .send({ from: accounts[0], value: price })
      .then(() => setChangeCounter(changeCounter + 1));
  }

  const handleTextChange = e => {
    e.preventDefault();
    const web3 = new Web3(Web3.givenProvider);
    const contract = new web3.eth.Contract(BeaverWhisperer.abi, CONTRACT_ADDRESS);

    contract.methods.setBeaverSays(newBeaverSays)
      .send({ from: accounts[0] })
      .then(() => setChangeCounter(changeCounter + 1));
  }

  const hasAccounts = !!accounts.length;
  const isOwner = hasAccounts && accounts[0] === owner;

  return (
    <div className="App">
      <header className="App-header">
        <div className="section">
          <div>
            Beaver Says: {beaverSays}
          </div>
          <small>Owner: {owner}</small>
        </div>

        {!hasAccounts &&
          <button onClick={handleConnect}>Connect Metamask</button>
        }

        {!isOwner &&
          <form className="section" style={{ display: 'flex', flexDirection: 'column' }}
            onSubmit={handleBuy}>
            <label>Price</label>
            <input type="number" value={price}
              onChange={e => setPrice(e.target.value)}
              min={lastPrice + 1}
            />
            <small>{Web3.utils.fromWei(price + '')} Eth</small>
            <button type="submit" >Buy</button>
          </form>
        }

        {isOwner &&
          <form className="section"
            onSubmit={handleTextChange}
            style={{ display: 'flex', flexDirection: 'column' }}>
            <label>New Text</label>
            <input type="text" placeholder={beaverSays}
              minLength={2} value={newBeaverSays}
              onChange={e => setNewBeaverSays(e.target.value)} />
            <button type="submit" >Change Text</button>
          </form>
        }
      </header>
    </div>
  );
}

export default App;
