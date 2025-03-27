import { mock } from "bun:test";
import { z } from "zod";

export const mockValidate = mock(
  <T extends z.ZodType<any, any>>(
    schema: T,
    data: unknown,
    errorPrefix = "Validation error",
  ): z.infer<T> => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw new Error(`${errorPrefix}: ${formattedErrors}`);
      }
      throw error;
    }
  },
);

export const validate = mockValidate;
