
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

`/relays` shares the instance lifecycle, payment, subscription and activity APIs.
The customer plan selectors and payment controls remain in this repository:

- Service IDs are `nostr_strfry` (Nostr) and `iroh_relay` (Iroh), discovered
  through `GET /instance/types`. These services are excluded from LNbits lists
  and funding options. Relay connection addresses are `wss://<domain>` for Nostr
  and `https://<domain>` for Iroh; optional `relay_url` takes precedence.
- `GET /pricing?instance_type=nostr_strfry` supplies relay prices. Both types
  have fixed resources and 60 sats/hour, $5.71/week, **$20/month**, $200/year.
  `src/utils/relays.js` retains identical display fallback prices. LNbits
  Premium prices do not change relay prices.
- Creation sends the service ID, `payment_plan_tier: "relay"` and the selected
  `payment_plan_interval`. Extension sends the selected `payment_plan_name` to
  `/instance/buy` or `/instance/subscribe`; the API stores that selection with
  the quote/subscription rather than charging the original interval.
- USD offers one-time purchases and recurring weekly/monthly/yearly checkout.
  Recurring checkout needs matching provider plan IDs configured in the API.
- Bitcoin offers Lightning and on-chain purchases for weekly/monthly/yearly.
  On-chain sends `payment_method: "onchain"` and requires a complete `bitcoin_uri`
  or checkout URL. Hourly uses prepaid Lightning through `/instance/hourly`.
- Payment completion is polled through `/instance`; relay addresses are never
  probed for LNbits wallet/first-install endpoints. On-chain settlement requires
  a confirmed payment and the API's background scanner. The API must point to
  an LNbits server with core on-chain support and a separate receiving wallet.

Run `npm run build` and `npm test`. Browser tests use API-shaped fixtures;
backend payment validation is covered in the SaaS API repository.

## Credits
Special thanks to [Pratik Patel](https://github.com/pratik227/quasar-admin) for the Quasar Template project.

## License

[MIT](http://opensource.org/licenses/MIT)
