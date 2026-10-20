
## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

## Relay frontend integration

`/relays` reuses `InstancesTable.vue` and the existing instance, payment,
subscription and activity endpoints. No backend implementation is included.
The frontend currently assumes this contract; coordinate these keys with the
relay backend before enabling paid provisioning:

- `POST /instance`: `instance_type` is `nostr` or `iroh`,
  `payment_plan_tier` is `relay`, and `payment_plan_interval` is `hourly`,
  `weekly`, `monthly` or `yearly`.
- `GET /instance` returns both LNbits instances and relays. Relay records use
  the same status, timestamps, ID and billing fields. `relay_url` optionally
  supplies the full connection address; otherwise the UI displays `domain`.
  The relay page provides a copy action instead of LNbits wallet, backup and
  first-install actions. Payment status polling uses the existing instance API,
  without probing LNbits-specific paths on a relay. Payments, Subscriptions and
  Activity include both service types and display `relay_url` when supplied.
- Both relay types display **$20/month**. `src/utils/relays.js` scales the
  LNbits Premium billing ratios from `/pricing` to that monthly price,
  rounding hourly sats up and fiat amounts to cents. If pricing is unavailable,
  it uses the legacy LNbits ratios (21 sats/hour, $2/week, $7/month, $70/year):
  60 sats/hour, $5.71/week and $200/year. These are frontend display prices;
  the backend must enforce the agreed relay prices.
- USD subscriptions reuse `PUT /instance/subscribe` and its
  `checkout_session_url`. Disabling automatic renewal uses
  `PUT /instance/buy` with `is_fiat: true`.
- Lightning purchases reuse `/instance/buy` with `is_fiat: false` and the
  existing `payment_request` response. Hourly billing uses the instance's
  prepaid `lnurl`, as for LNbits.
- On-chain purchases use the same `/instance/buy` payload with the additional
  `payment_method: "onchain"` field. The backend must return either a complete
  BIP21 `bitcoin_uri` (including the payable amount) or `checkout_session_url`.
  The UI does not derive a BTC amount or reuse a Lightning invoice for on-chain
  checkout. On-chain support is new API work required for both service areas.

Run `npm test` for browser checks, including the mocked relay integration tests
in `test/relays.spec.js`.

## Credits
Special thanks to [Pratik Patel](https://github.com/pratik227/quasar-admin) for the Quasar Template project.

## License

[MIT](http://opensource.org/licenses/MIT)
