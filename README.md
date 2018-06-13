# Ledger-Support for the Romeo IOTA Wallet

Here we bring Ledger Nano S functionality to the Romeo wallet for IOTA.

Instead of needing to enter your seed (which potentially exposes your seed to malicious parties), all address and signature generation is handed off to the Ledger Nano S. The seed never leaves the device, so you don't have to worry about someone stealing it. There are still other things to be aware of, so for the full documentation visit: [Ledger Nano S Documentation](https://github.com/IOTA-Ledger/blue-app-iota/blob/master/Ledger%20Nano%20S%20Documentation.md).

## How to start local server with Ledger-Support
```
# get neweset version of git dependencies
yarn upgrade
# run local server
yarn run run
```
Open the provided address in Chrome or Opera and follow instructions.

## How to prepare to start developing

You need to checkout:
- hw-app-iota.js [master](https://github.com/IOTA-Ledger/hw-app-iota.js/tree/master)
- romeo.lib [feature/ledger-support](https://github.com/IOTA-Ledger/romeo.lib/tree/feature/ledger-support)
- romeo.html [feature/ledger-support](https://github.com/IOTA-Ledger/romeo.html/tree/feature/ledger-support)

Then you need to go to hw-app-iota and do a `yarn link`.
Then to romeo.lib and do a `yarn link hw-app-iota` and `yarn link`.
Then to romeo.html and do a `yarn link hw-app-iota`, `yarn link romeo.lib` and then you can do a `yarn run run` to start a local https server.

# CarrIOTA Romeo - Ultra-Light-Ledger

CarrIOTA Romeo is a lightweight ledger built on top of the IOTA Tangle.
It compiles to a single HTML file, including all images, fonts,
stylesheets and scripts, which is used as an interface for the end user.

The HTML file can be copied to any computer, USB Stick or hosted on a
server, giving access to the IOTA Tangle and the powerful tools built on
top of it offered by Romeo.

## WARNING

This software is experimental. Use at your own risk!

## Contributing

### Donations

**Donations always welcome**:
* _SemkoDev_ - `AAJXXFJUEQHKPYIOUIUO9FWCMOAFBZAZPXIFRI9FLDQZJGHQENG9HNMODUZJCHR9RHHUSBHWJELGRDOWZRNWYLYCQW`
* _Ledger Dev Team_ - `ADLJXS9SKYQKMVQFXR9JDUUJHJWGDNWHQZMDGJFGZOX9BZEKDSXBSPZTTWEYPTNM9OZMYDQWZXFHRTXRCOITXAGCJZ` 

## Authors

* **Roman Semko** - _SemkoDev_ - (https://github.com/romansemko)
* _Ledger Dev Team_ 

## License

This project is licensed under the ICS License - see the [LICENSE.md](LICENSE.md) file for details.
