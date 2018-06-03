# Ledger-Support for the Romeo IOTA Wallet

Here we bring Ledger Nano S functionality to the Romeo wallet for IOTA.

Instead of needing to enter your seed (which potentially exposes your seed to malicious parties), all address and signature generation is handed off to the Ledger Nano S. The seed never leaves the device, so you don't have to worry about someone stealing it. There are still other things to be aware of, so for the full documentation visit: [Ledger Nano S Documentation](https://github.com/IOTA-Ledger/blue-app-iota/blob/master/Ledger%20Nano%20S%20Documentation.md).

# CarrIOTA Romeo - Ultra-Light-Ledger

CarrIOTA Romeo is a lightweight ledger built on top of the IOTA Tangle.
It compiles to a single HTML file, including all images, fonts,
stylesheets and scripts, which is used as an interface for the end user.

The HTML file can be copied to any computer, USB Stick or hosted on a
server, giving access to the IOTA Tangle and the powerful tools built on
top of it offered by Romeo.

## How to use

Please check the Articles on [Deviota Medium](https://medium.com/deviota) for instructions.
Download the latest release from the releases tab.

**BEFORE RUNNING**: Check that the file has not been tampered with.
**It's MD5 Signature should match** the one given in the release information!

You can use command-line tools on your OS or upload the file at [OnlineMD5](http://onlinemd5.com/)

**NOTE**: Safari is currently NOT supported!

## How to compile locally

Clone or download the repository. Then run:

```
# Install packages:
yarn
# Build:
yarn run pack
```

This will create a file called romeo-X.X.X.html in the root folder
of the project.

This project is a mere frontend interface to **romeo.lib**, which
holds the bulk of the system. The frontend is not clean nor documented.
It's work in progress. Please bear with the simplicity.

## WARNING

This software is experimental. Use at your own risk!

## Contributing

### Donations

**Donations always welcome**:

```
AAJXXFJUEQHKPYIOUIUO9FWCMOAFBZAZPXIFRI9FLDQZJGHQENG9HNMODUZJCHR9RHHUSBHWJELGRDOWZRNWYLYCQW
```

## Authors

* **Roman Semko** - _SemkoDev_ - (https://github.com/romansemko)

## License

This project is licensed under the ICS License - see the [LICENSE.md](LICENSE.md) file for details.
