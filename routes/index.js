var express = require('express');
var router = express.Router();

const { ethers } = require('ethers');
const { SiweMessage, generateNonce } = require('siwe');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SIWE Example' });
});

// Store the nonce for checking against log-in
let nonce;

// Generate the nonce
router.get('/api/nonce', async (req, res) => {
  nonce = generateNonce();
  console.log(`Nonce generated on server: ${nonce}`);
  res.send(nonce);
})

// Handle the session on the Express server
router.post('/api/sign_in', async (req, res) => {
  /**
   * Get the message and signature from the request
   */
  const { message, signature } = req.body;

  /**
   * Format the message
   */
  const messageSIWE = new SiweMessage(message);

  /**
   * Instantiate a default provider instance
   */
  const provider = ethers.getDefaultProvider();

  /**
   * Validate the SIWE message received from client
   */
  const fields = await messageSIWE.validate(signature, provider); // siwe npm package yet to implement verify
  if (fields.nonce !== nonce) {
    res.status(422).json({
      message: "Invalid nonce: Client and Server nonce mismatch"
    });
    return;
  }
  console.log(`SIWE message: `)
  console.debug(fields);
  console.log(`Successfully logged in on the server`)

  /**
   * Return success message to client
   */
  res.status(200).json({
    message: "Successfully logged in!"
  })
})

module.exports = router;
