# NotificationOptions

Public interface declared in packages/core/src/framework/views/notifications.ts.

## Usage

Import NotificationOptions from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface NotificationOptions {

  /** Stable identity used to address this contribution. */
  id?: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Semantic severity used to style the notification. */
  severity?: NotificationSeverity;

  /** Optional expanded notification content. */
  details?: string;

  /** Optional application source identifying the notification origin. */
  source?: string;

  /** Optional host priority annotation retained with the notification. */
  priority?: string;

  /** Dismissal delay in milliseconds; zero keeps the notification persistent. */
  duration?: number;

  /** Optional application action offered by the notification. */
  action?: NotificationAction;
}
```

## Reference

<!-- frame:generated type="NotificationOptions" -->

```ts
export interface NotificationOptions {

  /** Stable identity used to address this contribution. */
  id?: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Semantic severity used to style the notification. */
  severity?: NotificationSeverity;

  /** Optional expanded notification content. */
  details?: string;

  /** Optional application source identifying the notification origin. */
  source?: string;

  /** Optional host priority annotation retained with the notification. */
  priority?: string;

  /** Dismissal delay in milliseconds; zero keeps the notification persistent. */
  duration?: number;

  /** Optional application action offered by the notification. */
  action?: NotificationAction;
}
```

| Name       | Type                   | Description                                                              |
| ---------- | ---------------------- | ------------------------------------------------------------------------ |
| `id`       | `string`               | Stable identity used to address this contribution.                       |
| `title`    | `string`               | Heading displayed by the owning presentation.                            |
| `severity` | `NotificationSeverity` | Semantic severity used to style the notification.                        |
| `details`  | `string`               | Optional expanded notification content.                                  |
| `source`   | `string`               | Optional application source identifying the notification origin.         |
| `priority` | `string`               | Optional host priority annotation retained with the notification.        |
| `duration` | `number`               | Dismissal delay in milliseconds; zero keeps the notification persistent. |
| `action`   | `NotificationAction`   | Optional application action offered by the notification.                 |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **title** (string): Visible heading.
- **severity** (NotificationSeverity): Severity configuration for this component; see its Features examples for usage.
- **details** (string): Details configuration for this component; see its Features examples for usage.
- **source** (string): Source configuration for this component; see its Features examples for usage.
- **priority** (string): Priority configuration for this component; see its Features examples for usage.
- **duration** (number): Duration configuration for this component; see its Features examples for usage.
- **action** (NotificationAction): Action configuration for this component; see its Features examples for usage.
