# zonemta-multi-dkim

Load & use a dkim key file based on a header value, example : with header `X-random-header: random-domain-2`, zmta will use dkim key : `/path/to/zone-mta/keys/random-domain-2.pem`

## Setup

Add this as a dependency for your ZoneMTA app

```shell
npm install @mindbaz/zonemta-multi-dkim --save
```

## Configure

The module uses `wild-config`, so there are two `toml` configuration files to manage

### Plugin conf

Add a configuration entry in the "plugins" section of your ZoneMTA app

Example [here](./config.example.toml).

### Wild-config

ZoneMTA uses the following file for wild-config : `/path/to/zone-mta/config/zonemta.toml`

```toml
# Keys list, used to valid keys file name without extention .pem
[multi_dkim]
keys = [
  "random-domain-1",
  "random-domain-2",
  "random-domain-3"
]
```

## License

The GNU General Public License 3 ([details](https://www.gnu.org/licenses/quick-guide-gplv3.en.html))
