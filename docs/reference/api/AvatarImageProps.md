# AvatarImageProps

Public interface declared in node_modules/.bun/reka-ui@2.11.0+501eebc2bdcde416/node_modules/reka-ui/dist/index3.d.ts.

## Usage

Import AvatarImageProps from reka-ui. The definition below is the source contract; optional fields may be omitted.

```typescript
interface AvatarImageProps extends PrimitiveProps {
  src: string;
  referrerPolicy?: ImgHTMLAttributes['referrerpolicy'];
  crossOrigin?: ImgHTMLAttributes['crossorigin'];
}
```

## Reference

<!-- frame:generated type="AvatarImageProps" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **src** (string): Src configuration for this component; see its Features examples for usage.
- **referrerPolicy** (ImgHTMLAttributes['referrerpolicy']): Referrer Policy configuration for this component; see its Features examples for usage.
- **crossOrigin** (ImgHTMLAttributes['crossorigin']): Cross Origin configuration for this component; see its Features examples for usage.
