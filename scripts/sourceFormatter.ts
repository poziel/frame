import {format, resolveConfig} from 'prettier';
import {MemberFormatter} from './memberFormatter';
import {ParameterFormatter} from './parameterFormatter';

/**
 * Applies the complete project format rather than stock formatter defaults.
 * Prettier supplies language-aware baseline formatting; focused syntax-aware
 * passes then restore the agreed TypeScript and Vue script conventions.
 */
export class SourceFormatter {

  /** Shared baseline configuration, including language-specific overrides. */
  private readonly configPath: string;

  /** Preserves the agreed spacing around documented members. */
  private readonly members = new MemberFormatter();

  /**
   * Creates the project formatter with a checked-in configuration.
   *
   * @param configPath - Path to the shared checked-in formatter configuration.
   */
  constructor(configPath: string) {
    this.configPath = configPath;
  }

  /**
   * Formats code or documentation using the complete project pipeline.
   *
   * @param source - Original editable source.
   * @param filename - Filename selecting the language parser.
   * @returns Canonical project formatting, ready for comparison or writing.
   */
  async format(source: string, filename: string): Promise<string> {
    const options = await resolveConfig(filename, {config: this.configPath});
    let result = await format(source, {...options, filepath: filename});
    if (/\.(?:[cm]?[jt]sx?|vue)$/.test(filename)) {
      result = this.members.format(result, filename);
      result = new ParameterFormatter(options?.printWidth ?? 80).format(
        result,
        filename
      );
    }
    return result;
  }
}
