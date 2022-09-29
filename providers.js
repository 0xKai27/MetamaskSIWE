const { ethers } = require('ethers');
const { SiweMessage } = require('siwe');

const loginButton = document.querySelector('#login');

loginButton.addEventListener('click', async () => {
    /**
     * Get the provider and signer from the browser window
     */
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    /**
     * Get the active account
     */
    const [address] = await provider.listAccounts();
    console.log(`Address used to construct SIWE message: ${address}`);

    /**
     * Gets a randomly generated nonce from the SIWE library. This nonce is added 
     * to the session so we can check it on sign in. For security purposes, this
     * is generated on the server
     */
    const nonce = await fetch('/api/nonce').then(res => res.text());
    console.log(`Nonce returned from server stored on client: ${nonce}`);

    /**
     * Get the chain id
     */
    const chainId = (await provider.getNetwork()).chainId;
    console.debug(chainId);

    /**
     * Creates the message object
     */
    const message = new SiweMessage({
        domain: document.location.host,
        address,
        chainId,
        uri: document.location.origin,
        version: '1',
        statement: 'Metamask SIWE Example',
        nonce,
    });
    console.log(`SIWE message constructed in the client:`)
    console.debug(message);

    /**
     * Generates the message to be signed and uses the provider to ask for a signature
     */
    const signature = await signer.signMessage(message.prepareMessage());
    console.log(`Signed message signature: ${signature}`);

    /**
     * Calls the sign_in endpoint to validate the message. On success, the
     * console woill display the message returned from server
     */
    await fetch('/api/sign_in', {
        method: 'POST',
        body: JSON.stringify({message, signature}),
        headers: { 'Content-Type': 'application/json' }
    }).then(async (res) => {
        const message = await res.text();
        console.log(JSON.parse(message).message);
    })

})