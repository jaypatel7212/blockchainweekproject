const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "04084e3ad2b8f18e9b7b226dc2338459450bae4f8f04398f8e100d3933da43ac840e4cdf1da945dabcf626cdae4a3d504e89eec87d0078aa3c7a0f5b5ada570dbd": 100,
  "042c0dadbcae32fd745742ef7f8a99e045bd2b53b9c07f3867c8cd776d036ba6ea4a3ce7187bee3cdb6831d9e17a86824f9b55fda70504042ff8bb328db44d3ae6": 50,
  "041eea52892f79c18d892e85a57166b82a8631e0736ba84a0edc5d03e396d272e4ece9f7c055a531316915b1e4fde13e742c3568499a21e8bbff1c8be5468a065a": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, nonce, signTxn } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  // retrieve signature and recovery bit
  const [signature, recoveryBit] = signTxn;
  // convert signature to Uint8Array
  const formattedSignature = Uint8Array.from(Object.values(signature));
  //message hash
  const msgToBytes = utf8ToBytes(recipient + amount + JSON.stringify(nonce));
  const msgHash = toHex(keccak256(msgToBytes));

  // recover public key
  const publicKey = await secp.recoverPublicKey(
    msgHash,
    formattedSignature,
    recoveryBit
  );

  // verify transection
  const verifyTx = secp.verify(formattedSignature, msgHash, publicKey);

  if (!verifyTx) {
    res.status(400).send({ message: "Invalid Transection" });
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else if (sender == recipient) {
    res.status(400).send({ message: "Please! Enter Another address" });
  } else if (recipient && amount) {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  } else {
    res.status(400).send({ message: "Something Went Wrong !!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
