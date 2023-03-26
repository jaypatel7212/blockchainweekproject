const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "045f2acf55240c1990c1986ceb004cb2aa839d7ea8bf3939550fe646b5bd797725e515758f0aa621c65de164a4e65d0e43209ce3742bdcd19d9ae06718e7142601": 100,
  "047a6a8d41c761431badc5e19f05a84d93307de205112184689b44329cdce63b3b7b5c3c35ae4f14ed6daa2dad6ff0f93977d4bf7b2775b88eea52e646764aa444": 50,
  "044bcd458a77db4201a1b477fb60355610c39c5be02c577b984dffbc28f2d0f8842aa29a522663df683d224adecb7f2496bcdd72b7b543954defaa0557dc0430ce": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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
