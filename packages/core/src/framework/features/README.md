# Feature availability

`FeatureRegistry` owns feature availability for one Frame instance. `Feature`
provides the live item API and change subscriptions. Availability remains
separate from permissions, command registration, and presentation visibility.

Module installation stays in `configuration/moduleRegistry.ts`: installing a
capability and enabling a feature have distinct lifecycles.
