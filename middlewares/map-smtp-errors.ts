import { BadRequestErorr } from "../errors/bad-request.erorr";
import { TooManyRequests } from "../errors/too-many-requests";

export function mapEmailError(error: unknown): never {
    if (!(error instanceof Error) || !("code" in error)) {
        throw error;
    }
    const code = String(error.code);
    switch (code) {
        case "EENVELOPE": // Invalid sender/recipient address
        case "EMESSAGE":  // Malformed message structure
            throw new BadRequestErorr();

        case "ERATELIMIT":// Provider API rate limit reached
        case "EPROTOCOL": // Server usage policy exceeded (e.g., Gmail 500/day limit)
            throw new TooManyRequests();

        default:
            throw error;
    }
}