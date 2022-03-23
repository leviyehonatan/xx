const openpgp = require("openpgp");
(async () => {

    const generateKey = async () => {
        return await openpgp.generateKey({
            type: "rsa", // Type of the key, defaults to ECC
            rsaBits: 2048,
            //curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: { name: "Jon Smith", email: "jon@example.com" }, // { name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
            format: "armored" // output key format, defaults to 'armored' (other options: 'binary' or 'object')
        });
    }

    let keys = []
    keys.push(await generateKey())
    keys.push(await generateKey())
    const plaintext = "Hello, World!";
    try {
        let publicKeys = await Promise.all(keys.map(async (key, index) => {
            return await openpgp.readKey({ armoredKey: key.publicKey })
        }))

        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: plaintext }), // input as Message object
            encryptionKeys: publicKeys
        });

        const encryptedMessage = await openpgp.readMessage({
            armoredMessage: encrypted // parse armored message
        });

        const privateKeys = await Promise.all(keys.map(async (key, index) => {
            return await openpgp.readPrivateKey({ armoredKey: key.privateKey })
        }))
        const decrypted = await openpgp.decrypt({
            message: encryptedMessage, // parse armored message
            decryptionKeys: privateKeys // for decryption
        });
        console.log(decrypted.data)
        // keys.forEach(async (key, i) => {
        //     //console.log({ key })
        //     const privateKey = await openpgp.readPrivateKey({
        //         armoredKey: key.privateKey,
        //     })

        //     const decrypted = await openpgp.decrypt({
        //         message: encryptedMessage, // parse armored message
        //         decryptionKeys: privateKey // for decryption
        //     });
        //     //console.log(decrypted.data)
        // })
    } catch (err) {
        console.log(err);
    }
})();
