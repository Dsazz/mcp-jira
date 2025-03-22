/**
 * GetTimeTool implementation
 * Retrieves the current system time in the specified format
 */
import { SystemTimeTool } from '../system-time-tool';
import { DateFormatter } from '../../formatters/date.formatter';
import { getTimeParamsSchema } from './get-time.schema';
import { GetTimeParams } from './get-time.types';
import { SystemTimeConfig } from '../../config/system-time-config';
import { validate } from '../../../../shared/validation/zod-validator';
/**
 * Tool for retrieving and formatting the current system time
 */
export class GetTimeTool extends SystemTimeTool<GetTimeParams, string> {
  private formatter: DateFormatter;
  
  /**
   * Create a new GetTimeTool with configuration
   */
  constructor(config: SystemTimeConfig) {
    super('Get Time', config);
    this.formatter = new DateFormatter();
  }
  
  /**
   * Execute the tool logic
   * Retrieves current time and formats it according to parameters
   */
  protected execute(params: GetTimeParams): string {
    try {
      // Validate parameters
      const validParams = validate(getTimeParamsSchema, params, 'Invalid time parameters');
      
      // Get format from parameters or config
      const format = validParams.format || this.getConfig().defaultDateFormat;
      
      this.logger.info(`Getting system time with format: ${format}`);
      
      // Format the current time using the formatter
      return this.formatter.format({ format });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }
} 