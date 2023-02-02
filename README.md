# zonemta-multi-dkim

Load & use a dkim key file based on a header value, example : with header `X-random-header: random-domain-2`, zmta will use dkim key : `/path/to/zone-mta/keys/random-domain-2.pem`

## Setup

Add this as a dependency for your ZoneMTA app

```
npm install @mindbaz/zonemta-multi-dkim --save
```

Add a configuration entry in the "plugins" section of your ZoneMTA app

Example [here](./config.example.toml).

## License

The GNU General Public License 3 ([details](https://www.gnu.org/licenses/quick-guide-gplv3.en.html))
