# Romeo - Ultra-Light-Ledger

Romeo is a lightweight ledger built on top of the IOTA Tangle.
It compiles to a single HTML file, including all images, fonts,
stylesheets and scripts, which is used as an interface for the end user.

The HTML file can be copied to any computer, USB Stick or hosted on a
server, giving access to the IOTA Tangle and the powerful tools built on
top of it offered by Romeo.

## How to use

Please check the Articles on [Deviota Medium](https://medium.com/deviota) for instructions.
Romeo is bundled within a single page and it runs anywhere on most browsers. However,
if you intend to use ledger, the file has to be running on a HTTPS server, either locally or
hosted somewhere.

Each release is automatically built and hosted here:

https://semkodev.gitlab.io/romeo.html

You can access Romeo from that link. In order to download a local copy of romeo, simply
select "save as" in your browser and save the page anywhere on your computer.

**NOTE**: Safari is currently NOT supported!

## How to run locally with HTTPS (for Ledger Nano S)

You will nodeJS and yarn installed on your computer. Using the command line, execute the
following command to start a local server:

```
yarn run
```

Afterwards access Romeo at https://localhost:1234

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

## Authors

* **Roman Semko** - _SemkoDev_ - (https://github.com/romansemko)

## License

This project is licensed under the ICS License - see the [LICENSE.md](LICENSE.md) file for details.
